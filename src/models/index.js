// models/index.js
const PrevisaoSemanal = require("./PrevisaoSemanal");
const PrevisaoHistorica = require("./PrevisaoHistorica");

// Função para inicializar todas as tabelas
async function initializeModels() {
  await PrevisaoSemanal.createTable();
  await PrevisaoHistorica.createTable();
  console.log("Tabelas do modelo inicializadas.");
}

module.exports = {
  PrevisaoSemanal,
  PrevisaoHistorica,
  initializeModels,
};
