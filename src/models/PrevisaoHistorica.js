// models/PrevisaoHistorica.js
const db = require('../config/database');
const {getDateBr} = require('../utils/helpers')

class PrevisaoHistorica {
  static tableName = 'previsoes_historicas';

  // 🗄️ Cria a tabela própria do histórico
  static async createTable() {
    // models/PrevisaoHistorica.js - Dentro de createTable()
const sql = `
  CREATE TABLE IF NOT EXISTS ${this.tableName} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cidade VARCHAR(255) NOT NULL,
    horario_registro TIME NOT NULL,
    temperatura VARCHAR(10),
    clima TEXT,
    link_clima VARCHAR(500),
    umidade_valor VARCHAR(10),
    raio_uv_valor VARCHAR(10),
    ventos_valor VARCHAR(10),
    created_at DATETIME NOT NULL,
    INDEX idx_cidade_created (cidade, created_at),
    INDEX idx_cidade_horario (cidade, horario_registro)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    await db.query(sql);
    console.log(`✅ Tabela '${this.tableName}' verificada/criada.`);
  }

  // 📥 Método independente para salvar histórico (recebe dados brutos)
  static async registrar(cidade, dados) {
    const { horario, temperatura, clima, linkClima, infoDia } = dados;
    const umidadeInfo =
      infoDia.find((item) => item.nome.includes('Umidade')) || {};
    const uvInfo = infoDia.find((item) => item.nome.includes('Raio UV')) || {};
    const ventosInfo =
      infoDia.find((item) => item.nome.includes('Ventos')) || {};
      const data = getDateBr();
      const createdAtBrasilia = data.toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
    INSERT INTO ${this.tableName} (
      cidade, horario_registro, temperatura, clima, link_clima,
      umidade_valor, raio_uv_valor, ventos_valor, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    cidade,
    horario,
    temperatura,
    clima,
    linkClima,
    umidadeInfo.valor || null,
    uvInfo.valor || null,
    ventosInfo.valor || null,
    createdAtBrasilia // Enviando a data correta aqui
  ]);

    console.log(
      `📦 Histórico salvo: ${cidade} às ${horario} (ID: ${result.insertId})`,
    );
    return { id: result.insertId, cidade, horario };
  }

  // 🔍 Busca histórico de uma cidade (todos os registros)
  static async buscarPorCidade(cidade, limite = 100) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE cidade = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [cidade, limite]);
    return rows;
  }

  // 🔍 Busca por período específico
  static async buscarPorPeriodo(cidade, dataInicio, dataFim) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE cidade = ? 
      AND created_at BETWEEN ? AND ?
      ORDER BY created_at ASC
    `;
    const [rows] = await db.query(sql, [cidade, dataInicio, dataFim]);
    return rows;
  }

  // 📊 Conta quantos registros existem para uma cidade
  static async contarPorCidade(cidade) {
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE cidade = ?`,
      [cidade],
    );
    return rows[0].total;
  }
}

module.exports = PrevisaoHistorica;
