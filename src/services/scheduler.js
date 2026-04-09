// services/scheduler.js
const CIDADES = ["Camacari-BA", "Vitoria Da Conquista-BA"];
const coletarClima = require("./coletarClima");

function deveExecutarAgora() {
  const agoraBR = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const data = new Date(agoraBR);
  const hora = data.getHours();
  const minuto = data.getMinutes();

  return (
    (minuto === 0 && hora >= 1 && hora <= 23) || (hora === 0 && minuto === 15)
  );
}

async function executarColeta() {
  for (const cidade of CIDADES) {
    await coletarClima(cidade);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

module.exports = { deveExecutarAgora, executarColeta };
