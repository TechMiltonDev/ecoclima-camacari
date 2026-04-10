// services/scheduler.js
const CIDADES = ['Camacari-BA', 'Vitoria Da Conquista-BA'];
const coletarClima = require('./coletarClima');
// Verifique se este caminho está correto. Se helpers.js estiver em utils/, e scheduler em services/, ../utils/helpers está certo.
const { getAttrSafe, getTextSafe, getDateBr } = require('../utils/helpers');

function deveExecutarAgora() {
  const data = getDateBr();
  
  // Proteção contra falha na importação
  if (typeof data.getHours !== 'function') {
    console.error("Erro: getDateBr não retornou um objeto Date válido.");
    return false;
  }

  const hora = data.getHours();
  const minuto = data.getMinutes();

  return (
    (minuto === 0 && hora >= 1 && hora <= 23) || (hora === 0 && minuto === 15)
  );
}

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

module.exports = { deveExecutarAgora, executarColeta };