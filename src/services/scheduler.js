// services/scheduler.js
const CIDADES = ['Camacari-BA', 'Vitoria Da Conquista-BA'];
const coletarClima = require('./coletarClima');
// Verifique se este caminho está correto. Se helpers.js estiver em utils/, e scheduler em services/, ../utils/helpers está certo.
const { getAttrSafe, getTextSafe, getDateBr } = require('../utils/helpers');

async function executarColeta() {
  for (const cidade of CIDADES) {
    try {
      await coletarClima(true, cidade);
    } catch (error) {
      console.error(`Erro ao coletar dados de ${cidade}:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

module.exports = executarColeta;
