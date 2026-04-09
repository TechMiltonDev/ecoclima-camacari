// models/index.js
const PrevisaoHistorica = require('./PrevisaoHistorica');

// Função para inicializar todas as tabelas
async function initializeModels() {
  await PrevisaoHistorica.createTable();
  console.log('Tabelas do modelo inicializadas.');
}

module.exports = {
  PrevisaoHistorica,
  initializeModels,
};
