import { pool } from "./connect.js";

export async function  getUsers(){
    const q = `SELECT * FROM users;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getUser(user_id){
    const q = `SELECT * FROM users WHERE user_id = ?;`
    const [result_rows] = await pool.query(q,[user_id]);
    return result_rows[0]
}

export async function  getRoles(){
    const q = `SELECT * FROM roles;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

// export async function addUser (userData) {
//     console.log("request body -->",userData)
//     // Validate request body
//     if (!userData.username || !userData.password) {
//         console.log("provided information :", userData);
//         return next(new Error("Username and password are required"));
//     }
    
//     const connection = await pool.getConnection();
//     try {
//         // Check if user exists with the provided username
//         const q1 = "SELECT * FROM users WHERE user_name = ?";
//         const [data] = await pool.query(q1, [userData.username]);
//         if (data.length !== 0) throw (new Error("Username already exists"));

//         //hash the password
//         const salt = bycrpt.genSaltSync(10);
//         const hashedPassword = bycrpt.hashSync(userData.password, salt);

//         // Start transaction
//         await connection.beginTransaction();
//         // Insert new user into the database
//         const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name,role_id) VALUES (?,?,?,?,?)";
//         const values2 = [
//             userData.username,
//             userData.email,
//             userData.firstName,
//             userData.lastName,
//             userData.role_id
//         ];
//         const [result] = await connection.query(q2, values2);

//         const user_id = result.insertId

//         const q3 = "INSERT INTO users_credentials (user_id, user_password_hash) VALUES (?,?)";
//         const values3 = [
//             user_id,
//             hashedPassword
//         ];
//         await connection.query(q3, values3);

//         await connection.commit();

//         res.status(201).json({ message: "User registered successfully", user_id });
//     } catch (error) {
//         await connection.rollback();
//         throw(error);
//     }finally {
//         // Release the connection back to the pool
//         if (connection)   connection.release();
//     }
// }