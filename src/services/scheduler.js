// services/scheduler.js
const CIDADES = [
  { nome: 'Camacari-BA', id: 892 },
  { nome: 'Vitoria Da Conquista-BA', id: 59 },
];
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
