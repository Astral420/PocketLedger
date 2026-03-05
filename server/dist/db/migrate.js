"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_1 = __importDefault(require("../config/DB"));
const migrationsDir = path_1.default.join(__dirname, "migrations");
async function waitForDatabase(maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await DB_1.default.query("SELECT NOW()");
            process.stderr.write("✓ Database connected\n");
            return;
        }
        catch {
            if (i < maxRetries - 1) {
                process.stderr.write(`Waiting for database... (attempt ${i + 1}/${maxRetries})\n`);
                await new Promise((r) => setTimeout(r, 1000));
            }
            else {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
            }
        }
    }
}
async function runMigrations() {
    try {
        process.stderr.write("Starting migrations...\n");
        process.stderr.write("Waiting for database connection...\n");
        await waitForDatabase();
        await DB_1.default.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        if (!fs_1.default.existsSync(migrationsDir)) {
            process.stderr.write("✓ No migrations directory found, skipping migrations\n");
            return;
        }
        const files = fs_1.default.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
        if (files.length === 0) {
            process.stderr.write("✓ No migration files found, skipping migrations\n");
            return;
        }
        const result = await DB_1.default.query("SELECT name FROM migrations");
        const executed = new Set(result.rows.map(r => r.name));
        for (const file of files) {
            if (executed.has(file))
                continue;
            process.stderr.write(`Running migration: ${file}\n`);
            const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), "utf-8");
            await DB_1.default.query(sql);
            await DB_1.default.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
            process.stderr.write(`✓ Migration ${file} completed\n`);
        }
        process.stderr.write("✓ All migrations completed successfully\n");
    }
    catch (error) {
        process.stderr.write(`Migration error: ${error?.message}\n`);
        process.stderr.write(`${error?.stack}\n`);
        process.stderr.write("⚠️  Database connection failed - server will start without database\n");
    }
}
