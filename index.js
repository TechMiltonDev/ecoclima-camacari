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

app.get("/", async (req, res) => {
  const { temperatura, clima, cidade, linkClima, umidade } =
    await coletarClima();
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
