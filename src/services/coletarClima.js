const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs")

let getAttrSafe = ($element, attr) => {
      if (!$element || $element.length === 0) return "";
      const val = $element.attr(attr);
      return val ? val.trim() : "";
    };
    
let getTextSafe = ($element) => {
      if (!$element || $element.length === 0) return "";
      const val = $element.text();
      return val ? val.trim() : "";
    };

async function coletarClima(ipUser) {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    const cidade = "Camaçari - BA";
    const cidadeFormatada = cidade
      .normalize("NFD")
      .replace(/[Çç]/g, "c")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-]/g, "") // ← Adicionado o hífen aqui
      .replace(/\s+/g, "")
      .toLowerCase();

    const response = await axios.get(
      `https://www.otempo.com.br/tempo/${cidadeFormatada}`,
    );
    const html = response.data;
    fs.writeFile('pagina.html', html, (err) => {
      if (err) throw err;
      console.log('Arquivo HTML salvo com sucesso!');
    });
    const $ = cheerio.load(html);

    const climaAtual = $(
      "div.weather-card__middle div.weather-card__current-weather",
    )
      .map((i, el) => {
        const $el = $(el);

        // Agora use $el.find em vez de el.find
        let $imgClima = $el.find(
          "div img.weather-card__current-weather__icon",
        );
        
        let $elDiv = $el.find(
          "div.d-flex.flex-column",
        );
        
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
          temperatura: getTextSafe($elTemp)
            .replace(/\s+/g, ""),
          clima: getTextSafe($elClima),
          linkClima: getAttrSafe($imgClima, "src")
            .replace(/\s+/g, ""),
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
            .replace(/\s+/g, ""),
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
      "div ul.weather-list-forecast li.weather-list-forecast__item",
    )
      .map((i, el) => {
        const $el = $(el);

        // Agora use $el.find em vez de el.find
        let $imgClima = $el.find(
          "div.weather-list-forecast__item__right img.weather-list-forecast__item__icon",
        );

        if ($imgClima.length === 0) {
          $imgClima = $el.find("div.weather-list-forecast__item__right img");
        }
        return {
          dia: $(el)
            .find("p.weather-list-forecast__item__description")
            .text()
            .trim(),
          tempMin: $(el)
            .find(
              "div.weather-list-forecast__item__box-min span.weather-list-forecast__item__box-min__description",
            )
            .text()
            .replace(/\s+/g, ""),
          tempMax: $(el)
            .find(
              "div.weather-list-forecast__item__box-max span.weather-list-forecast__item__box-max__description",
            )
            .text()
            .replace(/\s+/g, ""),
          // Usa a função segura: se não tiver imagem, retorna string vazia em vez de crashar
          clima: getAttrSafe($imgClima, "alt"),
          linkClima: getAttrSafe($imgClima, "src").replace(/\s+/g, ""),
        };
      })
      .get();

    return {
      temperatura: climaAtual[0].temperatura,
      clima: climaAtual[0].clima,
      linkClima: climaAtual[0].linkClima,
      umidade: infoDia[1].valor,
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
