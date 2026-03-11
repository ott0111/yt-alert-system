import pkg from "pg";
import { logInfo, logError } from "./logger.js";

const { Pool } = pkg;

let pool;

export function initDb() {
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    console.error("POSTGRES_URL is not set.");
    process.exit(1);
  }

  pool = new Pool({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  return setupSchema();
}

async function setupSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id SERIAL PRIMARY KEY,
        youtube_channel_id TEXT NOT NULL,
        youtube_channel_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        youtube_channel_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        video_title TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    logInfo("Database schema ensured.");
  } catch (err) {
    logError("Error setting up DB schema: " + err.message);
    throw err;
  }
}

export function getDb() {
  if (!pool) {
    throw new Error("DB not initialized");
  }
  return pool;
}
