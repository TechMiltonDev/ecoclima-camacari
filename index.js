const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

// Importar a função de inicialização dos modelos
const { initializeModels, PrevisaoSemanal } = require("./src/models"); // Caminho relativo para models/index.js

const coletarClima = require("./src/services/coletarClima"); // ou o caminho correto para o seu service
const ejs = require("ejs");
const app = express();
const port = 3000;

const {
  deveExecutarAgora,
  executarColeta,
} = require("./src/services/scheduler");

// 🔹 Endpoint protegido para o Vercel Cron chamar
app.get("/api/coleta-cron", async (req, res) => {
  // 🔐 Proteção com token secreto (opcional mas recomendado)
  const authHeader = req.headers["authorization"];
  const CRON_SECRET = process.env.CRON_SECRET;

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  // 🔹 Verifica se é a hora certa no fuso de Brasília
  const force = req.query.force === "true";

  if (!force && !deveExecutarAgora() && !process.env.CRON_STATUS === "true") {
    const agoraBR = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    return res.json({
      skipped: true,
      message: `Ainda não é hora. Horário Brasília: ${agoraBR}`,
    });
  }

  console.log("🔄 Executando coleta agendada...");

  try {
    await executarColeta();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicializar os modelos (criar tabelas se não existirem)
async function startServer() {
  try {
    await initializeModels(); // <- Chama a inicialização aqui
    console.log("Modelos inicializados com sucesso.");

    app.use(express.json());
    app.engine("html", ejs.renderFile);
    app.set("view engine", "html");
    app.set("views", __dirname + "/src/views");

    app.get("/", async (req, res) => {
      const { temperatura, clima, cidade, linkClima, umidade } =
        await coletarClima(process.env.DEVELOPMENT === "true", "Camaçari-BA");

      let dadosSemanais = await PrevisaoSemanal.buscarPorCidade("Camaçari-BA");
      if (!dadosSemanais || dadosSemanais.length === 0) {
        dadosSemanais = [];
      }
      console.log(dadosSemanais);

      res.render("index", {
        temperatura,
        clima,
        cidade,
        linkClima,
        umidade,
        dadosSemanais, // lista de dicionarios com: temp_max, temp_min, dia_previsto. No dia previsto pode ta escrito Amanhã
      });
    });

    app.listen(port, () => {
      console.log(`Servidor rodando na Porta: ${port}`);
    });
  } catch (error) {
    console.error("Erro ao inicializar os modelos:", error);
    process.exit(1); // Sai do processo se não conseguir inicializar
  }
}

startServer();
