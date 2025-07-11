import { pool } from "./connect.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";

const roleMap = {
    1: 'user', 
    2: 'employee',
    3: 'admin'
};

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
        const token = jwt.sign( {user_id: data1[0].user_id , role_id: data1[0].role_id} , process.env.JWT_SECRET, { expiresIn: '24h' });    
        res.cookie('accessToken', token, {
            // httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            // secure: true, // <-- REQUIRED for SameSite=None
            // sameSite: 'None', // <-- REQUIRED for cross-site cookie sharing
            
            httpOnly: false,        // Allow access from JavaScript (XSS risk)
            secure: false,          // Allow over HTTP (MITM risk)
            sameSite: 'Lax',        // Allows some cross-site requests
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

export async function verifyUserJWT (req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error("No token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role_id < 1) {
      throw new Error("Access denied: you have to be loged in");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: roleMap[decoded.role_id],
    }; 
    next();
  } catch (error) {
    next(error); 
  }
}

export async function verifyAdminJWT(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error("No token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role_id !== 3) {
      throw new Error("Access denied: admin only");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: roleMap[decoded.role_id],
    }; 
    next();
  } catch (error) {
    next(error); 
  }
}

export async function verifyEmployeeJWT(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error("No token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role_id < 2) {
      throw new Error("Access denied: employee or admin only");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: roleMap[decoded.role_id],
    }; 
    next();
  } catch (error) {
    next(error); 
  }
}

export async function addUser (req, res, next) {
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
        const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name,role_id) VALUES (?,?,?,?,?)";        const values2 = [
            req.body.username,
            req.body.email,
            req.body.firstName,
            req.body.lastName,
            req.body.role_id
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