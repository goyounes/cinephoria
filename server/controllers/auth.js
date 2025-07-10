import { pool } from "./connect.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register (req, res, next) {
    // Validate request body
    if (!req.body.username || !req.body.password) {
        console.log("provided information :", req.body);
        return next(new Error("Username and password are required"));
    }
    
    const connection = await pool.getConnection();
    try {
        // Check if user exists with the provided username
        const q1 = "SELECT * FROM users WHERE user_name = ?";
        const [data] = await pool.query(q1, [req.body.username]);
        if (data.length !== 0) return next(new Error("Username already exists"));

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
        const q1 = "SELECT * FROM users WHERE user_name = ?";
        const [data1] = await pool.query(q1 ,[req.body.username]);
        if (data1.length === 0) return next(new Error("This username does not exist"));

        // Get the user_id
        const user_id = data1[0].user_id;

        // Get the user's password hash
        const q2 = "SELECT user_password_hash FROM users_credentials WHERE user_id = ?";
        const [data2] = await pool.query(q2 ,[user_id]);
        if (data2.length === 0) return next(new Error("No credentials found for this user... desync in the database?"));

        // Get the password hash
        const passwordHash = data2[0].user_password_hash;

        //Check the hash
        const isPasswordValid = bycrpt.compareSync(req.body.password, passwordHash);
        if (!isPasswordValid) return next(new Error("Invalid password"));

        // If everything is fine, return the user_id signed using a JWT token
        const token = jwt.sign( {user_id: data1[0].user_id , role_id: data1[0].role_id} , "cinephoria_secret", { expiresIn: '24h' });    
        res.cookie('accessToken', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            // secure: true, // <-- REQUIRED for SameSite=None
            // sameSite: 'None', // <-- REQUIRED for cross-site cookie sharing
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        }).status(200).json(data1[0]);
    }catch (error) {
        next(error);
    }

}
export async function logout (req, res, next) {
    //clear the cookie representing the JWT token
    res.clearCookie('accessToken',{
        secure: true,
        sameSite:"none"
    })
    .status(200).json({ message: "Logged out successfully" });
}

export async function verifyJWT (req, res, next) {
    // Get the user_id from the JWT token
    // accesing accessToken from the cookies
    const token = req.cookies.accessToken;
    if (!token) return next(new Error("No token provided"));
    console.log(token)
    try {
        // Verify the token
        const decoded = jwt.verify(token, "cinephoria_secret");
        // if (decoded.role_id == 1) return next(new Error("User"));
        // if (decoded.role_id == 2) return next(new Error("Employee"));
        // if (decoded.role_id == 3) return next(new Error("Admin"));
        if (decoded.role_id !== 3) return next(new Error("Not Admin"));
        console.log(token, decoded);

        // If everything is fine, return the user_id
        next();
    }catch (error) {
        next(error);
    }
}