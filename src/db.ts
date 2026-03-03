import mysql from 'mysql2/promise';
import { config } from './config';

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function upsertPrice(energyType: string, priceDate: string, category: string, value: number | null) {
  const sql = `INSERT INTO energy_market_prices (energy_type, price_date, category, value, created_on)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE value = VALUES(value), updated_on = NOW()`;
  const params = [energyType, priceDate, category, value];
  const [res] = await pool.query(sql, params);
  return res as any;
}

export default pool;
