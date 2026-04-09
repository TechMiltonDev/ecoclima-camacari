// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASS || 'SenhaAppUser123!',
  database: process.env.DB_NAME || 'meu_app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false 
});

module.exports = pool;