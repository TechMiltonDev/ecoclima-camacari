const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');

dotenv.config();

// Importar a função de inicialização dos modelos
const { initializeModels, PrevisaoHistorica } = require('./src/models'); // Caminho relativo para models/index.js
const loginController = require('./src/controller/login');
const cadastroController = require('./src/controller/cadastro');
const upload = require('./src/config/upload');
const uploadController = require('./src/controller/uploadController');
const verificarSessao = require('./src/middlewares/auth');
const verifyOrigin = require('./src/middlewares/verifyOrigin'); // <--- IMPORTE AQUI

const coletarClima = require('./src/services/coletarClima'); // ou o caminho correto para o seu service
const app = express();
const PORT = 3000;

const executarColeta = require('./src/services/scheduler');

// 🔹 Endpoint protegido para o Vercel Cron chamar
app.get('/api/coleta-cron', async (req, res) => {
  // 🔐 Proteção com token secreto (opcional mas recomendado)
  const authHeader = req.headers['authorization'];
  const CRON_SECRET = process.env.CRON_SECRET;

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (process.env.CRON_STATUS !== 'true') {
    return res.json({
      skipped: true,
      message: 'cron desligado',
    });
  }

  console.log('🔄 Executando coleta agendada...');

  try {
    await executarColeta();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/src/views');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', async (req, res) => {
  const { dadosAtual, infoDia, cidade, dadosSemanais } = await coletarClima(
    process.env.DEVELOPMENT === 'true',
    'Camaçari-BA',
  );

  res.render('index', {
    dadosAtual,
    infoDia,
    cidade,
    dadosSemanais, // lista de dicionarios com: tempMax, tempMin, dia, nomeDia. No dia previsto pode ta escrito Amanhã
  });
});

app.get('/climas', (req, res) => {
  res.render('climas');
});

app.post('/climas', async (req, res) => {
  const cidade = req.body.cidade || 'Camaçari-BA';
  const limite = req.body.limite || 100;
  const dadosCidades = await PrevisaoHistorica.buscarPorCidade(cidade, limite);

  res.json({
    sucesso: true,
    dadosCidade, // cidade, horario_registro (não é o horario real, é so a hora), temperatura, clima, link_clima, umidade_valor, raio_uv_valor, ventos_valor, created_at
  });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/cadastro', verifyOrigin, cadastroController);

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', verifyOrigin, loginController);

app.get('/uploads', verificarSessao({ admin: true }), (req, res) => {
  res.render('uploads');
});

const uploadFields = upload.fields([
  { name: 'nomeImagem', maxCount: 1 },
  { name: 'arquivo', maxCount: 1 },
]);

// Rota Protegida
app.post(
  '/upload',
  verificarSessao({ admin: true }),
  verifyOrigin,
  uploadFields,
  uploadController,
);

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na Porta: ${PORT}`);
});

async function startServer() {
  try {
    await initializeModels();
    console.log('✅ Modelos e tabelas verificados.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na Porta: ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro crítico ao iniciar:', error);
    process.exit(1);
  }
}

startServer();
