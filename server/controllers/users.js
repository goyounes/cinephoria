import { pool } from "./connect.js";

export async function  getUsers(){
    const q = `SELECT * FROM users;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getUser(user_id){
    const q = `SELECT * FROM users WHERE user_id = ?;`
    const [result_rows] = await pool.query(q,user_id);
    return result_rows
}

export async function  getRoles(){
    const q = `SELECT * FROM roles;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
