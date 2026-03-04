import fs from "fs";
import path from "path";
import pool from "../config/DB";

const migrationsDir = path.join(__dirname, "migrations");

async function waitForDatabase(maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query("SELECT NOW()");
      process.stderr.write("✓ Database connected\n");
      return;
    } catch {
      if (i < maxRetries - 1) {
        process.stderr.write(`Waiting for database... (attempt ${i + 1}/${maxRetries})\n`);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }
    }
  }
}

export default async function runMigrations() {
  try {
    process.stderr.write("Starting migrations...\n");
    process.stderr.write("Waiting for database connection...\n");
    await waitForDatabase();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (!fs.existsSync(migrationsDir)) {
      process.stderr.write("✓ No migrations directory found, skipping migrations\n");
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    if (files.length === 0) {
      process.stderr.write("✓ No migration files found, skipping migrations\n");
      return;
    }

    const result = await pool.query<{ name: string }>("SELECT name FROM migrations");
    const executed = new Set(result.rows.map(r => r.name));

    for (const file of files) {
      if (executed.has(file)) continue;

      process.stderr.write(`Running migration: ${file}\n`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      await pool.query(sql);
      await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);

      process.stderr.write(`✓ Migration ${file} completed\n`);
    }

    process.stderr.write("✓ All migrations completed successfully\n");
  } catch (error: any) {
    process.stderr.write(`Migration error: ${error?.message}\n`);
    process.stderr.write(`${error?.stack}\n`);
    process.stderr.write("⚠️  Database connection failed - server will start without database\n");
  }
}