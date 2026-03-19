const axios = require("axios");
const cheerio = require("cheerio");

async function coletarClima(ipUser) {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    const { data } = await axios.get(`https://ipinfo.io/${ipUser}/json`);
    estados = {
      Acre: "AC",
      Alagoas: "AL",
      Amapá: "AP",
      Amazonas: "AM",
      Bahia: "BA",
      Ceará: "CE",
      "Distrito Federal": "DF",
      "Espírito Santo": "ES",
      Goiás: "GO",
      Maranhão: "MA",
      "Mato Grosso": "MT",
      "Mato Grosso do Sul": "MS",
      "Minas Gerais": "MG",
      Pará: "PA",
      Paraíba: "PB",
      Paraná: "PR",
      Pernambuco: "PE",
      Piauí: "PI",
      "Rio de Janeiro": "RJ",
      "Rio Grande do Norte": "RN",
      "Rio Grande do Sul": "RS",
      Rondônia: "RO",
      Roraima: "RR",
      "Santa Catarina": "SC",
      "São Paulo": "SP",
      Sergipe: "SE",
      Tocantins: "TO",
    };
    const estado = data?.region;
    const estadoSigla = estados?.[estado].toLowerCase();
    const cidade = data?.city
      // Normaliza para decompor acentos (ex: "é" vira "e + ´")
      .normalize("NFD")
      // Substitui ç por c
      .replace(/[Çç]/g, "c")
      // Remove os diacríticos (acentos)
      .replace(/[\u0300-\u036f]/g, "")
      // Remove caracteres especiais, mantendo letras, números e espaços
      .replace(/[^a-zA-Z0-9 ]/g, "")
      // Substitui espaços por barras
      .replace(/\s+/g, "/")
      .toLowerCase();

    const response = await axios.get(
      `https://www.otempo.com.br/tempo/${cidade}-${estadoSigla}`,
    );
    const html = response.data;
    const $ = cheerio.load(html);

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
            .replace(/\s+/g, ""),
          linkClima: $(el)
            .find("div.weather-card__forecast__box__icon img")
            .attr("src")
            .replace(/\s+/g, ""),
        };
      })
      .get();

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

    const getAttrSafe = ($element, attr) => {
      if (!$element || $element.length === 0) return "";
      const val = $element.attr(attr);
      return val ? val.trim() : "";
    };

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
      temperatura: previsaoDia[0].temperatura,
      clima: previsaoDia[0].clima,
      linkClima: previsaoDia[0].linkClima,
      umidade: infoDia[1].valor,
      cidade: cidade + "-" + estadoSigla,
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
