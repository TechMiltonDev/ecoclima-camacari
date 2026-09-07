const db = require('../config/database');
const { getDateBr } = require('../utils/helpers');

class PrevisaoHistorica {
  static tableName = 'previsoes_historicas';

  // 🗄️ Cria/Verifica a tabela própria do histórico
  static async createTable() {
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
    sensacao_termica_valor VARCHAR(10),
    ventos_valor VARCHAR(10),
    created_at DATETIME NOT NULL,
    INDEX idx_cidade_created (cidade, created_at),
    INDEX idx_cidade_horario (cidade, horario_registro)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    await db.query(sql);
    console.log(`✅ Tabela '${this.tableName}' verificada/criada.`);
  }

  // 📥 Método para salvar histórico e retornar o ID correto
  static async registrar(cidade, dados) {
    const {
      horario,
      temperatura,
      vento,
      umidade,
      sensacaoTermica,
      clima,
      linkClima,
    } = dados;
    const data = getDateBr();
    const createdAtBrasilia = data.toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
    INSERT INTO ${this.tableName} (
      cidade, horario_registro, temperatura, clima, link_clima,
      umidade_valor, raio_uv_valor, sensacao_termica_valor, ventos_valor, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const res = await db.query(sql, [
      cidade,
      horario,
      temperatura,
      clima,
      linkClima,
      umidade || null,
      null,
      sensacaoTermica || null,
      vento || null,
      createdAtBrasilia,
    ]);

    // Trata se o retorno do driver (mysql2/mariadb) for array ou objeto direto
    const result = Array.isArray(res) ? res[0] : res;
    const insertedId = result?.insertId || result?.insertid;

    console.log(
      `📦 Histórico salvo: ${cidade} às ${horario} (ID: ${insertedId})`,
    );
    return { id: insertedId, cidade, horario };
  }

  // 🔍 Busca os N registros mais recentes, reordenando em ordem crescente (mais novo ao final)
  static async buscarPorCidade(cidade, limite = 100) {
    const sql = `
      SELECT * FROM (
        SELECT * FROM ${this.tableName} 
        WHERE cidade = ? 
        ORDER BY id DESC 
        LIMIT ?
      ) AS sub
      ORDER BY id ASC
    `;
    const res = await db.query(sql, [cidade, Number(limite)]);
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : res;
    return rows;
  }

  // 🔍 Busca por período específico (Crescente por ID)
  static async buscarPorPeriodo(cidade, dataInicio, dataFim) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE cidade = ? 
      AND created_at BETWEEN ? AND ?
      ORDER BY id ASC
    `;
    const res = await db.query(sql, [cidade, dataInicio, dataFim]);
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : res;
    return rows;
  }

  // 📊 Conta quantos registros existem para uma cidade
  static async contarPorCidade(cidade) {
    const res = await db.query(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE cidade = ?`,
      [cidade],
    );
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : res;
    return rows[0].total;
  }
}

module.exports = PrevisaoHistorica;
