import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

const pool = new Pool({
  host: "localhost",      // Use localhost when running outside Docker
  port: 5432,
  database: "mydatabase",
  user: "postgres",
  password: "yourpassword",       // Make sure this matches your docker-compose.yml
  max: 10,
});

async function runMigrations() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const migrationDir = path.join(__dirname, "migrations");
  
  const files = fs.readdirSync(migrationDir).sort();
  
  for (const file of files) {
    const filePath = path.join(migrationDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    
    console.log(`Running migration ${file}...`);
    await pool.query(sql);
  }
  
  console.log("All migrations applied.");
  await pool.end();
}

runMigrations().catch(console.error);
