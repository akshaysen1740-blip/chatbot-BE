import { Pool } from "pg";
import pgvector from "pgvector/pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "chatbot",
});

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await pgvector.registerTypes(client);
    console.log("PostgreSQL connected and pgvector initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
