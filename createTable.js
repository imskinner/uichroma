const { Pool } = require('pg');

require('dotenv').config();

const dbConfig = {
  connectionString: process.env.POSTGRES_URL,
};

const pool = new Pool(dbConfig);

const createTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS palettes (
        id SERIAL PRIMARY KEY,
        keywords TEXT NOT NULL,
        colors TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL
      );
    `;

    await pool.query(createTableQuery);

    console.log('Tabela criada com sucesso.');
  } catch (error) {
    console.error(`Erro ao criar a tabela: ${error.message}`);
  } finally {
    pool.end();
  }
};

createTable();
