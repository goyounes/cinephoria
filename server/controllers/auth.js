import { pool } from "./connect.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import {sendPasswordResetEmail, sendVerificationEmail } from "../api/emailClient.js";

const [rolesMap] = await pool.query("SELECT * FROM roles")
const getRoleNameById = (id) => rolesMap.find(r => r.role_id === id)?.role_name || null;

export async function registerService (req, res, next) {
    // Validate request body
    if (!req.body.username || !req.body.password) {
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
        // sendWelcomeEmail(req.body.email, req.body.username)
        // sendVerificationEmail(req.body.email, req.body.username)
        const emailVerificationToken = jwt.sign(
          { user_id, type: "email_verification" },
          process.env.EMAIL_VERIFICATION_SECRET,
          { expiresIn: "24h" }
        );
        // Build verification link
        const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
        await sendVerificationEmail(req.body.email, verificationLink);

        res.status(201).json({ message: "User registered successfully. Please verify your email.", user_id });
    } catch (error) {
        await connection.rollback();
        next(error);
    }finally {
        // Release the connection back to the pool
        if (connection)   connection.release();
    }
}

export async function verifyEmailService(req, res, next) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

    if (decoded.type !== "email_verification") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user_id = decoded.user_id;

    // Verify User does exists + is NOT already verified 
    const q1 = "SELECT isVerified FROM users WHERE user_id = ?"
    const [rows] =  await pool.query(q1, [user_id]);
    if (rows?.length === 0 ) return res.status(404).json({ message: "Account not found" });
    const isVerified = rows[0].isVerified
    if (isVerified) return res.status(409).json({ message: "Account already verified" });

    // Update user as verified
    const q2 = "UPDATE users SET isVerified = TRUE WHERE user_id = ?";
    await pool.query(q2, [user_id]);

    res.status(200).json({ message: "Email successfully verified" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(410).json({ message: "Verification link expired" });
    }
    return next(err);
  }
}

export async function resetPasswordReqService(req, res, next) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 1. Check if the user exists
    const q = "SELECT user_id FROM users WHERE user_email = ?";
    const [rows] = await pool.query(q, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No user with that email" });
    }

    const user_id = rows[0].user_id;

    // 2. Generate a secure token
    const resetToken = jwt.sign(
      { user_id, type: "password_reset" },
      process.env.PASSWORD_RESET_SECRET,
      { expiresIn: "1h" }
    );

    // 3. Build the reset link
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // 4. Send the email
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordService(req, res, next) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);

    if (decoded.type !== "password_reset") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user_id = decoded.user_id;

    // 2. Make sure user still exists
    const [rows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Hash the new password
    const salt = bycrpt.genSaltSync(10);
    const hashedPassword = bycrpt.hashSync(newPassword, salt);

    // 4. Update the password
    const updateQuery = "UPDATE users_credentials SET user_password_hash = ? WHERE user_id = ?";
    await pool.query(updateQuery, [hashedPassword, user_id]);

    return res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(410).json({ message: "Password reset link expired" });
    }
    return next(err);
  }
}

export async function loginService (req, res, next) {

    try {
        // Check if user exists with the provided username
        const q1 = "SELECT * FROM users WHERE user_email = ?";
        const [data1] = await pool.query(q1 ,[req.body.email]);
        if (data1.length === 0) return next(new Error("This email does not exist"));

        // Get the user_id
        const user = data1[0]
        const user_id = user.user_id;
        user.role_name = getRoleNameById(user.role_id)
        // Get the user's password hash
        const q2 = "SELECT user_password_hash FROM users_credentials WHERE user_id = ?";
        const [data2] = await pool.query(q2 ,[user_id]);
        if (data2.length === 0) return next(new Error("No credentials found for this user... desync in the database?"));

        // Get the password hash
        const passwordHash = data2[0].user_password_hash;

        //Check the hash
        const isPasswordValid = bycrpt.compareSync(req.body.password, passwordHash);
        if (!isPasswordValid) return next(new Error("Invalid password"));

        console.log("calculation for role", user.role_id, getRoleNameById(user.role_id))
        // If everything is fine, return the user_id signed using a JWT token
        const accessToken = jwt.sign(
          {user_id: user.user_id , role_id: user.role_id, role_name: user.role_name } ,
          process.env.ACCESS_JWT_SECRET,
          { expiresIn: '24h' }
        );    
        const refreshToken = jwt.sign(
          {user_id: user.user_id , role_id: user.role_id, role_name: user.role_name} ,
          process.env.REFRESH_JWT_SECRET,
          { expiresIn: '90d' }
        );  
        refreshTokens.push(refreshToken)

        res.cookie('accessToken', accessToken, {
            // httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            // secure: true, // <-- REQUIRED for SameSite=None
            // sameSite: 'None', // <-- REQUIRED for cross-site cookie sharing
            
            httpOnly: false,        // Allow access from JavaScript (XSS risk)
            secure: false,          // Allow over HTTP (MITM risk)
            sameSite: 'Lax',        // Allows some cross-site requests
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        }).status(200).json({
          ...user,
          accessToken,
          refreshToken
        });
    }catch (error) {
        next(error);
    }

}
export async function logoutService (req, res, next) {
    //clear the cookie representing the JWT token
    res.clearCookie('accessToken',{
        secure: true,
        sameSite:"none"
    })
    .status(200).json({ message: "Logged out successfully" });
}

let refreshTokens = []
export async function refreshService (req, res, next) {
    // take refresh token
    const refreshToken = req.body.token
    //send error if there is no token
    if(!refreshToken) return res.status(401).json("You are not authenticated")
    if(!refreshTokens.includes(refreshToken)) return res.status(403).json("Refresh token not valid")
    // Good --> send new acces token

    const accessToken = jwt.sign(
      {user_id: user.user_id , role_id: user.role_id, role_name: getRoleNameById(user.role_id)} ,
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '24h' }
    );    


    try {

        // Get the user_id
        const user = data1[0]
        const user_id = user.user_id;

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
        const accessToken = jwt.sign(
          {user_id: user.user_id , role_id: user.role_id, role_name: getRoleNameById(user.role_id)} ,
          process.env.ACCESS_JWT_SECRET,
          { expiresIn: '24h' }
        );    


        res.cookie('accessToken', accessToken, {
            // httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            // secure: true, // <-- REQUIRED for SameSite=None
            // sameSite: 'None', // <-- REQUIRED for cross-site cookie sharing
            
            httpOnly: false,        // Allow access from JavaScript (XSS risk)
            secure: false,          // Allow over HTTP (MITM risk)
            sameSite: 'Lax',        // Allows some cross-site requests
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        }).status(200).json({
          ...user,
          accessToken
        });
    }catch (error) {
        next(error);
    }

}

export async function verifyUserJWT (req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error("No token provided");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    if (decoded.role_id < 1) {
      throw new Error("Access denied: you have to be loged in");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
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
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    if (decoded.role_id !== 3) {
      throw new Error("Access denied: admin only");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
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
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    if (decoded.role_id < 2) {
      throw new Error("Access denied: employee or admin only");
    }
    req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
    }; 
    next();
  } catch (error) {
    next(error); 
  }
}

export async function addUser (req, res, next) {
    // Validate request body
    if (!req.body.username || !req.body.password || !req.body.username ) {
        console.log("provided information :", req.body);
        return next(new Error("Username, Email and password are required"));
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