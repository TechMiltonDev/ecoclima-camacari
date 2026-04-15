// models/index.js
const PrevisaoHistorica = require('./PrevisaoHistorica');
const Users = require('./Users');

// Função para inicializar todas as tabelas
async function initializeModels() {
  await PrevisaoHistorica.createTable();
  await Users.createTable();
  console.log('Tabelas do modelo inicializadas.');
}

module.exports = {
  PrevisaoHistorica,
  Users,
  initializeModels,
};
