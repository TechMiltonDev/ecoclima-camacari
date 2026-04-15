// models/Users.js
const db = require('../config/database');
const { getDateBr } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

class Users {
  static tableName = 'usuarios';

  // 🗄️ Cria a tabela própria do histórico
  static async createTable() {
    const sql = `
  CREATE TABLE IF NOT EXISTS ${this.tableName} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha VARCHAR(128),
    assinou TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL,
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    await db.query(sql);
    console.log(`✅ Tabela '${this.tableName}' verificada/criada.`);
  }

  static async registrarUsuario(nome, email, senha, assinouStatus = false) {
    const sql = `
    INSERT INTO ${this.tableName} (nome, email, senha, assinou, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
    // 1. Define o custo do processamento (10 é o padrão seguro)
    const saltRounds = 10;

    // 2. Gera a senha criptografada
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
    // Passando o booleano diretamente (o driver converte para 0 ou 1)
    const [result] = await db.query(sql, [
      nome,
      email,
      senhaCriptografada,
      assinouStatus,
    ]);
    return result.insertId;
  }

  // Dentro da sua classe no arquivo models/Users.js

  static async atualizarAssinatura(id, status) {
    // O status (true/false) será convertido automaticamente para 1 ou 0 pelo driver
    const sql = `
    UPDATE ${this.tableName} 
    SET assinou = ? 
    WHERE id = ?
  `;

    try {
      const [result] = await db.query(sql, [status, id]);

      if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
      }

      console.log(
        `✅ Status de assinatura do usuário ${id} atualizado para: ${status}`,
      );
      return { sucesso: true, id, novoStatus: status };
    } catch (error) {
      console.error('❌ Erro ao atualizar assinatura:', error.message);
      throw error;
    }
  }

  // 🔍 Busca histórico de uma cidade (todos os registros)
  static async buscarUsuarioPorEmail(email) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  // 🔍 Busca por período específico
  static async contarAssinantes() {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE assinou = ?
    `;
    const numAssinantes = [await db.query(sql, [1])].length;
    return numAssinantes;
  }
}

module.exports = Users;
