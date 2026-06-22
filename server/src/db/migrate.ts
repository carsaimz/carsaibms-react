/**
 * Runs schema.sql against the configured MySQL database.
 * Usage: npm run db:migrate
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'carsai_react';
  console.log(`→ Creating database \`${dbName}\` if not exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.changeUser({ database: dbName });

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('→ Running schema.sql...');
  await connection.query(sql);

  console.log('✓ Migration complete.');
  console.log('');
  console.log('  Demo accounts (password: "password"):');
  console.log('    Admin:    admin@carsai.co.mz');
  console.log('    Customer: cliente@carsai.co.mz');

  await connection.end();
}

main().catch((err) => {
  console.error('✗ Migration failed:', err.message);
  process.exit(1);
});
