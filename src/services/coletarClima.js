const axios = require("axios");

async function coletarClima() {
  try {
    const API_KEY = process.env.API_KEY;
    const { data } = await axios.get(
      `https://api.hgbrasil.com/weather?city_name=Camacari,BA&key=${API_KEY}`,
    );
    const resultados = data.results;
    const temperatura = resultados.temp;
    const clima = resultados.description;
    const cidade = resultados.city;
    const slogan = resultados.condition_slug;
    return { temperatura, clima, cidade, slogan };
  } catch (error) {
    console.error("Erro ao coletar dados do clima:", error);
    return { temperatura: null, clima: null, cidade: null, slogan: null };
  }
}

module.exports = coletarClima;
