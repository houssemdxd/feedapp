// src/lib/mysql.ts
import mysql, { Pool, RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2/promise";

const {
  MYSQL_HOST = "127.0.0.1",
  MYSQL_PORT = "3306",
  MYSQL_USER = "root",
  MYSQL_PASSWORD = "",
  MYSQL_DATABASE = "appdb",
} = process.env;

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    multipleStatements: true,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await conn.end();
  }
}

async function ensureTables() {
  if (!pool) throw new Error("Pool not initialized.");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email        VARCHAR(191) NOT NULL,
      password     VARCHAR(255) NOT NULL,
      fname        VARCHAR(100) NOT NULL DEFAULT '',
      lname        VARCHAR(100) NOT NULL DEFAULT '',
      role         ENUM('client','organization') NOT NULL DEFAULT 'client',
      phone        VARCHAR(50)  NOT NULL DEFAULT '',
      bio          VARCHAR(255) NOT NULL DEFAULT '',
      title        VARCHAR(100) NOT NULL DEFAULT '',
      location     VARCHAR(100) NOT NULL DEFAULT '',
      image        VARCHAR(255) NOT NULL DEFAULT '',
      created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function init() {
  await ensureDatabase();
  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
  await ensureTables();
}

export async function getPool(): Promise<Pool> {
  if (!initPromise) initPromise = init();
  await initPromise;
  if (!pool) throw new Error("MySQL pool not available");
  return pool;
}

/**
 * Typed query helper.
 * - For SELECTs: call as query<YourRowType[]>("SELECT ...")
 * - For INSERT/UPDATE/DELETE: call as query<ResultSetHeader>("UPDATE ...")
 */
export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  values?: any
): Promise<[T, FieldPacket[]]> {
  const p = await getPool();
  return p.query<T>(sql, values);
}
