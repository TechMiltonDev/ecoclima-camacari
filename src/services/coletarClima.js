const axios = require("axios");
const cheerio = require("cheerio");
const { getAttrSafe, getTextSafe } = require("../utils/helpers");
const { PrevisaoSemanal, PrevisaoHistorica } = require("../models");

async function coletarClima(salvarDados = false, cidade = "Camaçari-BA") {
  try {
    const cidadeFormatada = cidade
      .normalize("NFD")
      .replaceAll(" ", "-")
      .replace(/[Çç]/g, "c")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-]/g, "") // ← Adicionado o hífen aqui
      .replace(/\s+/g, "")
      .toLowerCase();

    const response = await axios.get(
      `https://www.otempo.com.br/tempo/${cidadeFormatada}`,
    );
    const html = response.data;
    const $ = cheerio.load(html);

    const climaAtual = $(
      "div.weather-card__middle div.weather-card__current-weather",
    )
      .map((i, el) => {
        const $el = $(el);

        // Agora use $el.find em vez de el.find
        let $imgClima = $el.find("div img.weather-card__current-weather__icon");

        let $elDiv = $el.find("div.d-flex.flex-column");

        let $elTemp = $elDiv.find(
          "span.weather-card__current-weather__temperature",
        );

        let $elClima = $elDiv.find(
          "span.weather-card__current-weather__condition-name",
        );

        return {
          horario: new Date().toLocaleString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          temperatura: getTextSafe($elTemp).replace(/\s+/g, "").replaceAll("°", ""),
          clima: getTextSafe($elClima),
          linkClima: getAttrSafe($imgClima, "src").replace(/\s+/g, ""),
        };
      })
      .get();

    const previsaoDia = $(
      "div.weather-card__forecast div.weather-card__forecast__box",
    )
      .map((i, el) => {
        return {
          horario: $(el)
            .find("div.weather-card__forecast__box__number")
            .text()
            .replace(/\s+/g, ""),
          temperatura: $(el)
            .find("div.weather-card__forecast__box__temperature")
            .text()
            .replace(/\s+/g, "").replaceAll("°", ""),
          clima: $(el)
            .find("div.weather-card__forecast__box__icon img")
            .attr("alt")
            .trim(),
          linkClima: $(el)
            .find("div.weather-card__forecast__box__icon img")
            .attr("src")
            .replace(/\s+/g, ""),
        };
      })
      .get();

    const horarioAtual = new Date().getHours();
    if (horarioAtual <= parseInt(previsaoDia[0].horario)) {
      previsaoDia.shift();
    }

    const infoDia = $(
      "div.weather-card__info-panel div.weather-card__info-panel__box",
    )
      .map((i, el) => {
        return {
          nome: $(el)
            .find("div.weather-card__info-panel__box__name")
            .text()
            .replace(/\s+/g, ""),
          valor: $(el)
            .find("div.weather-card__info-panel__box__description")
            .text()
            .replace(/\s+/g, ""),
          linkIcon: $(el)
            .find("div.weather-card__info-panel__box__icon img")
            .attr("src")
            .replace(/\s+/g, ""),
        };
      })
      .get();

    const previsoesDias = $(
      "div.aem-GridColumn.aem-GridColumn--default--4.aem-GridColumn--phone--12.mt-4.mt-md-0 ul.weather-list-forecast li.weather-list-forecast__item div.weather-list-forecast__item__box-min",
    )
      .map((i, el) => {
        const $el = $(el);
        // const $item = $el.parent().parent(); pegar o avô do elemento
        const $item = $el.closest('li'); // sobe até achar o primeiro match

        // Agora use $el.find em vez de el.find
        let $imgClima = $item.find(
          "div.weather-list-forecast__item__right img.weather-list-forecast__item__icon",
        );

        if ($imgClima.length === 0) {
          $imgClima = $item.find("div.weather-list-forecast__item__right img");
        }
        return {
            nomeDia: $item
            .find("h3.weather-list-forecast__item__title")
            .text()
            .trim(),
          dia: $item
            .find("p.weather-list-forecast__item__description")
            .text()
            .trim(),
          tempMin: $item
            .find(
              "div.weather-list-forecast__item__middle span.weather-list-forecast__item__box-min__description",
            )
            .text()
            .replace(/\s+/g, "").replaceAll("°", ""),
          tempMax: $item
            .find(
              "div.weather-list-forecast__item__middle span.weather-list-forecast__item__box-max__description",
            )
            .text()
            .replace(/\s+/g, "").replaceAll("°", ""),
          // Usa a função segura: se não tiver imagem, retorna string vazia em vez de crashar
          clima: getAttrSafe($imgClima, "alt"),
          linkClima: getAttrSafe($imgClima, "src").replace(/\s+/g, ""),
        };
      })
      .get();

    // INTEGRACAO COM MODELOS ---
    if (salvarDados) {
      if (climaAtual.length > 0) {
        // Combinar climaAtual com infoDia para a previsão diária
        const dadosDiaria = {
          ...climaAtual[0],
          infoDia: infoDia.map((item) => {
            return { nome: item.nome, valor: item.valor };
          }), // Passa o array completo de infoDia
          cidade: cidade,
        };

        // Adicionar registro à Tabela 3 (Histórico) - COPIA os dados da Tabela 1, incluindo infoDia
        await PrevisaoHistorica.registrar(cidade, dadosDiaria);
      }

      if (previsoesDias.length > 0) {
        // Atualizar Tabela 2
        await PrevisaoSemanal.atualizar(cidade, previsoesDias);
      }
    }

    console.log(`Dados dos climas de ${cidade}.`);

    return {
      temperatura: climaAtual[0]?.temperatura ?? null,
      clima: climaAtual[0]?.clima ?? null,
      linkClima: climaAtual[0]?.linkClima ?? null,
      umidade: infoDia.find((i) => i.nome?.includes("Umidade"))?.valor ?? null,
      cidade: cidade,
    };
  } catch (error) {
    console.error("Erro ao coletar dados do clima:", error.message);
    return {
      temperatura: null,
      clima: null,
      cidade: null,
      linkClima: null,
      umidade: null,
    };
  }
}

module.exports = coletarClima;
