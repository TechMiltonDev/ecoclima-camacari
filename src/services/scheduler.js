// services/scheduler.js
const CIDADES = ['Camacari-BA', 'Vitoria Da Conquista-BA'];
const coletarClima = require('./coletarClima');
const {getDateBr} = require('../utils/helpers')

function deveExecutarAgora() {
  const data = getDateBr();
  const hora = data.getHours();
  const minuto = data.getMinutes();

  return (
    (minuto === 0 && hora >= 1 && hora <= 23) || (hora === 0 && minuto === 15)
  );
}

async function executarColeta() {
  for (const cidade of CIDADES) {
    await coletarClima(true, cidade);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

module.exports = { deveExecutarAgora, executarColeta };
