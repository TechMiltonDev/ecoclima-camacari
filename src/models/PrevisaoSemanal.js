// models/PrevisaoSemanal.js
const db = require("../config/database");

function parseDataPortugues(dataStr) {
  const meses = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  };

  // Ex: "Segunda, 06 Abr" → extrai dia e mês
  const match = dataStr.match(
    /(\d{1,2})\s+(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)/i,
  );
  if (!match) return new Date().toISOString().split("T")[0];

  const [, dia, mes] = match;
  const ano = new Date().getFullYear();
  return new Date(ano, meses[mes.toLowerCase()], dia)
    .toISOString()
    .split("T")[0];
}

class PrevisaoSemanal {
  static tableName = "previsoes_semanais";

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cidade VARCHAR(255) NOT NULL,
        nome_dia VARCHAR(10) NOT NULL,
        dia_previsto DATE NOT NULL,
        temp_min VARCHAR(10),
        temp_max VARCHAR(10),
        clima TEXT,
        link_clima VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(sql);
    console.log(`✅ Tabela '${this.tableName}' verificada/criada.`);
  }

  // Remove todos os dados antigos e insere os novos (atualização diária)
  static async atualizar(cidade, dados) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Limpar dados antigos da cidade
      await connection.query(`DELETE FROM ${this.tableName} WHERE cidade = ?`, [
        cidade,
      ]);

      // Inserir novas previsões para os próximos dias
      for (const item of dados) {
        const sql = `INSERT INTO ${this.tableName} (cidade, nome_dia, dia_previsto, temp_min, temp_max, clima, link_clima) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        // Supondo que 'dia' do scraping seja uma string legível como "Segunda, 06 Abr"
        // Converter para DATE (YYYY-MM-DD) é essencial
        const dataPrevista = parseDataPortugues(item.dia);
        await connection.query(sql, [
          cidade,
          item.nomeDia,
          dataPrevista,
          item.tempMin,
          item.tempMax,
          item.clima,
          item.linkClima,
        ]);
      }

      await connection.commit();
      console.log(`Previsão semanal atualizada para ${cidade}.`);
    } catch (error) {
      await connection.rollback();
      console.error("Erro ao atualizar previsão semanal:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async buscarPorCidade(cidade) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE cidade = ? ORDER BY dia_previsto ASC`,
      [cidade],
    );
    return rows;
  }
}

module.exports = PrevisaoSemanal;
