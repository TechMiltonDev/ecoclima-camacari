// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3000',
  user: process.env.DB_USERNAME || 'app_user',
  password: process.env.DB_PASSWORD || 'SenhaAppUser123!',
  database: process.env.DB_DATABASE || 'meu_app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    // Aqui ele lê o texto do certificado direto da variável de ambiente
    ca: process.env.TIDB_CA_CERT,
    rejectUnauthorized: true
    }
});

module.exports = pool;
