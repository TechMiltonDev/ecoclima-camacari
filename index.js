const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const coletarClima = require("./src/services/coletarClima");
const ejs = require("ejs");
const app = express();
const port = 3000;

app.use(express.json());
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/src/views");

// Configuração inicial do app (faça isso antes das rotas)
app.set("trust proxy", true);

app.get("/", async (req, res) => {
  // Método robusto para pegar o IP real, mesmo atrás de proxies (Vercel, Nginx, etc.)
  const ipUser =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    req.ip;
  console.log(ipUser);
  const { temperatura, clima, cidade, linkClima, umidade } =
    await coletarClima(ipUser);
  res.render("index", {
    temperatura,
    clima,
    cidade,
    linkClima,
    umidade,
    dadosSemanais: [0, 0, 0, 0, 0, 0, 0],
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na http://localhost:${port}`);
});
