const axios = require('axios');
const cheerio = require('cheerio');
const { PrevisaoHistorica } = require('../models/index');
const { getAttrSafe, getTextSafe, getDateBr } = require('../utils/helpers');

async function coletarClimaAtual(
  salvarDados = false,
  cidade = { nome: 'Camacari-BA', id: 892 },
) {
  try {
    const idCidade = cidade.id;
    const cidadeFormatada = cidade.nome
      .replaceAll(' ', '-')
      .normalize('NFD')
      .replace(/[Çç]/g, 'c')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '') // ← Adicionado o hífen aqui
      .replace(/\s+/g, '')
      .toLowerCase();

    const response = await axios.get(
      `https://www.climatempo.com.br/previsao-do-tempo/agora/cidade/${idCidade}/${cidadeFormatada}`,
    );
    const html = response.data;
    const $ = cheerio.load(html);

    const climaAtual = $('.now-forecast-card')
      .map((i, el) => {
        const $el = $(el);

        // Agora use $el.find em vez de el.find
        let $imgClima = $el.find('img.now-forecast-card__weather-icon');

        let $elTemp = $el.find('span.now-forecast-card__temperature');

        const metricas = {
          vento: '',
          umidade: '',
          sensacaoTermica: '',
        };

        $el.find('.now-forecast-card__metric').each((i, el) => {
          const nome = $(el)
            .find('.now-forecast-card__metric-heading')
            .text()
            .replace(/\s+/g, '');
          let valor = $(el)
            .find('.now-forecast-card__metric-value')
            .text()
            .replace(/\s+/g, '');

          valor = valor.includes('-') ? valor.split('-')[1] : valor;
          //const linkIcon = $(el)
          //   .find(
          //     '.now-forecast-card__metric-icon.now-forecast-card__metric-icon--wind',
          //   )
          //   .attr('src')
          //   .replace(/\s+/g, ''),
          if (nome.toLowerCase().includes('vento')) {
            metricas.vento = valor;
          } else if (nome.toLowerCase().includes('umidade')) {
            metricas.umidade = valor;
          } else if (
            nome.toLowerCase().includes('sensacao') ||
            nome.includes('sensaçãotérmica') ||
            nome.includes('sensa')
          ) {
            metricas.sensacaoTermica = valor;
          }
        });

        return {
          horario: getDateBr().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // Garante formato 24h (ex: 21:00 em vez de 09:00 PM)
          }),
          temperatura: getTextSafe($elTemp)
            .replace(/\s+/g, '')
            .replaceAll('°', ''),
          vento: metricas.vento,
          umidade: metricas.umidade,
          sensacaoTermica: metricas.sensacaoTermica,
          clima: getAttrSafe($imgClima, 'alt'),
          linkClima:
            'https://www.climatempo.com.br' +
            getAttrSafe($imgClima, 'src').replace(/\s+/g, ''),
        };
      })
      .get();

    const horarioAtual = new Date(getDateBr()).getHours();
    console.log(horarioAtual);
    // if (horarioAtual <= parseInt(previsaoDia[0].horario)) {
    //   previsaoDia.shift();
    // }

    // INTEGRACAO COM MODELOS ---
    if (salvarDados) {
      if (climaAtual.length > 0) {
        // Combinar climaAtual com infoDia para a previsão diária
        const dadosDiaria = {
          ...climaAtual[0],
        };

        // Adicionar registro à Tabela 3 (Histórico) - COPIA os dados da Tabela 1, incluindo infoDia
        await PrevisaoHistorica.registrar(cidade.nome, dadosDiaria);
      }
    }

    console.log(`Dados dos climas de ${cidade}.`);

    return {
      dadosAtual: climaAtual[0],
      cidade: cidade.nome,
    };
  } catch (error) {
    console.error('Erro ao coletar dados do clima:', error.message);
    return {
      dadosAtual: null,
      cidade: null,
    };
  }
}

async function coletarClimaHoje(cidade = 'Camaçari-BA') {
  const idCidade = cidade.id;
  const cidadeFormatada = cidade.nome
    .replaceAll(' ', '-')
    .normalize('NFD')
    .replace(/[Çç]/g, 'c')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '') // ← Adicionado o hífen aqui
    .replace(/\s+/g, '')
    .toLowerCase();

  const response = await axios.get(
    `https://www.climatempo.com.br/previsao-do-tempo/cidade/${idCidade}/${cidadeFormatada}`,
  );
  const html = response.data;
  const $ = cheerio.load(html);
  const previsaoDia = $('div.hourly-forecast-carousel__track')
    .map((i, el) => {
      return {
        horario: $(el)
          .find('.hourly-forecast-card__time')
          .text()
          .replace(/\s+/g, ''),
        temperatura: $(el)
          .find('.hourly-forecast-card__temp')
          .text()
          .replace(/\s+/g, '')
          .replaceAll('°', ''),
        clima: $(el)
          .find('.hourly-forecast-card__weather-icon')
          .attr('alt')
          .trim(),
        linkClima:
          'https://www.climatempo.com.br/' +
          $(el)
            .find('.hourly-forecast-card__weather-icon')
            .attr('data-src')
            .replace(/\s+/g, ''),
      };
    })
    .get();

  const infoDia = $('div.today-forecast-card__grid')
    .map((i, el) => {
      return {
        nome: $(el)
          .find('.daily-variables-grid__title')
          .text()
          .replace(/\s+/g, ''),
        valor: $(el).find('.daily-variables-grid__values').text().trim(),
        linkIcon:
          'https://www.climatempo.com.br/' +
          $(el)
            .find('.daily-variables-grid__icon')
            .attr('src')
            .replace(/\s+/g, ''),
      };
    })
    .get();
}

async function coletarClimaSemana(cidade = 'Camaçari-BA') {
  const idCidade = cidade.id;
  const cidadeFormatada = cidade.nome
    .replaceAll(' ', '-')
    .normalize('NFD')
    .replace(/[Çç]/g, 'c')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '') // ← Adicionado o hífen aqui
    .replace(/\s+/g, '')
    .toLowerCase();

  const response = await axios.get(
    `https://www.climatempo.com.br/previsao-do-tempo/15-dias/cidade/${idCidade}/${cidadeFormatada}`,
  );
  const html = response.data;
  const $ = cheerio.load(html);
  const previsoesDias = $('.agg-daily__header')
    .map((i, el) => {
      const $el = $(el);
      // const $item = $el.parent().parent(); pegar o avô do elemento

      // Agora use $el.find em vez de el.find
      let $imgClima = $item.find('.agg-daily__icon.lazyloaded');

      return {
        nomeDia: $item.find('.weekday').text().trim(),
        dia: $item.find('.date-inside-circle__day').text().trim(),
        tempMin: $item
          .find('.agg-daily__temp.-min')
          .text()
          .replace(/\s+/g, '')
          .replaceAll('°', ''),
        tempMax: $item
          .find('.agg-daily__temp.-max')
          .text()
          .replace(/\s+/g, '')
          .replaceAll('°', ''),
        // Usa a função segura: se não tiver imagem, retorna string vazia em vez de crashar
        clima: getAttrSafe($imgClima, 'alt'),
        linkClima:
          'https://www.climatempo.com.br/' +
          getAttrSafe($imgClima, 'data-src').replace(/\s+/g, ''),
      };
    })
    .get();
}

module.exports = { coletarClimaAtual, coletarClimaHoje, coletarClimaSemana };
