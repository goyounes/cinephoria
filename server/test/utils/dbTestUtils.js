import mysql from 'mysql2/promise';
import fs from 'fs';

// Read init.sql file content
const initSql = fs.readFileSync('../db/init.sql', 'utf8')
  .replace(/DELIMITER \/\/[\s\S]*?DELIMITER ;/g, ''); // Remove DELIMITER syntax for mysql2 compatibility

export async function setupTestDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '5599',
    multipleStatements: true
  });

  try {
    // Drop test database if exists and create fresh one
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.MYSQL_DATABASE}`);
    await connection.query(`CREATE DATABASE ${process.env.MYSQL_DATABASE}`);
    
    // Close connection and reconnect to the test database
    await connection.end();
    
    const dbConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '5599',
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true
    });

    try {
      // Execute the init SQL
      await dbConnection.query(initSql);
      console.log('Test database setup completed');
    } finally {
      await dbConnection.end();
    }
  } catch (error) {
    await connection.end();
    throw error;
  }
}

export async function cleanupTestDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '5599'
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.MYSQL_DATABASE}`);
    console.log('Test database cleaned up');
  } finally {
    await connection.end();
  }
}

export async function resetConnection() {
  // Just refresh the connection pool without touching data
  const { pool } = await import('../../config/mysqlConnect.js');
  await pool.execute('SELECT 1'); // Simple ping to ensure connection is alive
}