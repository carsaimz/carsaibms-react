import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carsai_react',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

/** Run a query and return rows */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/** Run a query and return the first row, or null */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Insert and return the inserted ID */
export async function insert(sql: string, params: any[] = []): Promise<number> {
  const [result] = await pool.execute(sql, params);
  return (result as any).insertId as number;
}

/** Update/delete and return affected rows */
export async function execute(sql: string, params: any[] = []): Promise<number> {
  const [result] = await pool.execute(sql, params);
  return (result as any).affectedRows as number;
}
