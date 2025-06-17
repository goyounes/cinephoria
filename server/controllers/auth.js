import { pool } from "./connect.js";
import bycrpt from "bcrypt";

export async function register (req, res, next) {
    // Validate request body
    if (!req.body.username || !req.body.password) {
        console.log("here")
        return next(new Error("Username and password are required"));
    }
    
    const connection = await pool.getConnection();
    try {
        // Check if user exists with the provided username
        const q1 = "SELECT * FROM users WHERE user_name = ?";
        const [result_rows] = await pool.query(q1, [req.body.username]);
        if (result_rows.length !== 0) return next(new Error("Username already exists"));

        //hash the password
        const salt = bycrpt.genSaltSync(10);
        const hashedPassword = bycrpt.hashSync(req.body.password, salt);

        // Start transaction
        await connection.beginTransaction();
        // Insert new user into the database
        const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name) VALUES (?,?,?,?)";
        const values2 = [
            req.body.username,
            req.body.email,
            req.body.firstName,
            req.body.lastName
        ];
        const [result] = await connection.query(q2, values2);

        const user_id = result.insertId

        const q3 = "INSERT INTO users_credentials (user_id, user_password_hash) VALUES (?,?)";
        const values3 = [
            user_id,
            hashedPassword
        ];
        await connection.query(q3, values3);

        await connection.commit();

        res.status(201).json({ message: "User registered successfully", user_id });
    } catch (error) {
        await connection.rollback();
        next(error);
    }finally {
        // Release the connection back to the pool
        if (connection)   connection.release();
    }
}

export async function login (req, res, next) {

    try {
        // Check if user exists with the provided username
        const q1 = "SELECT user_id FROM users WHERE user_name = ?";
        const [result_rows1] = await pool.query(q1 ,[req.body.username]);
        
        if (result_rows1.length === 0) return next(new Error("This username does not exist"));

        // Get the user_id
        const user_id = result_rows1[0].user_id;

        // Get the user's password hash
        const q2 = "SELECT user_password_hash FROM users_credentials WHERE user_id = ?";
        const [result_rows2] = await pool.query(q2 ,[user_id]);

        if (result_rows2.length === 0) return next(new Error("No credentials found for this user... desync in the database?"));
        const passwordHash = result_rows2[0].user_password_hash;

        //Check the hash
        const isPasswordValid = bycrpt.compareSync(req.body.password, passwordHash);
        if (!isPasswordValid) return next(new Error("Invalid password"));

        // If everything is fine, return the user_id signed using a JWT token
        // const token = jwt.sign({ user_id , role_id}, process.env.JWT_SECRET, { expiresIn: '1h' });    

        res.status(200).json({ message: "Login successful", user_id });
    }catch (error) {
        next(error);
    }

}
export async function logout (req, res, next) {
    //clear the cookie representing the JWT token
    // res.clearCookie('accesToken');  Assuming you set the JWT token in a cookie named 'accesToken'
}
