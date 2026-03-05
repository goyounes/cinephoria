import { RowDataPacket } from 'mysql2/promise';
import { pool } from "../config/mysqlConnect.js";
import { UserRow } from '../types/database.js';

interface UserWithRole extends UserRow {
    role_name: string;
}

export async function getAuthorizedUsers(): Promise<UserWithRole[]> {
    const q = `
        SELECT u.*, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.role_id > 1;
    `;
    const [result_rows] = await pool.query<UserWithRole[] & RowDataPacket[]>(q);
    return result_rows;
}

export async function getUser(user_id: number): Promise<UserRow | undefined> {
    const q = `SELECT * FROM users WHERE user_id = ?;`;
    const [result_rows] = await pool.query<UserRow[] & RowDataPacket[]>(q, [user_id]);
    return result_rows[0];
}
