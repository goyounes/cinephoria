import { pool } from "../config/mysqlConnect.js";
import { authRedis } from '../config/redisConnect.js';
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import {sendPasswordResetEmail, sendVerificationEmail } from "../api/emailClient.js";
import { 
  generateEmailVerificationLink, 
  generatePasswordResetLink, 
  signAccessToken, 
  signRefreshToken 
} from "../utils/index.js";
import { NextFunction, Request, Response } from "express";
import { UserRow } from "../types/database.js";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";


export async function registerService(req: Request, res: Response, next: NextFunction) {
  if (!req.body.username || !req.body.email || !req.body.password) {
    return next(new Error("Username, email and password are required"));
  }

  const connection = await pool.getConnection();
  try {
    const q1 = "SELECT * FROM users WHERE user_name = ?";
    const [data] = await connection.query(q1, [req.body.username]) as [UserRow[], FieldPacket[]];
    if (data.length !== 0) return next(new Error("Username already exists"));

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    await connection.beginTransaction();

    const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name) VALUES (?,?,?,?)";
    const values2 = [
      req.body.username,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
    ];
    const [result] = await connection.query(q2, values2) as [ResultSetHeader, FieldPacket[]];

    const user_id = result.insertId;

    const q3 = "INSERT INTO users_credentials (user_id, user_password_hash) VALUES (?,?)";
    await connection.query(q3, [user_id, hashedPassword]);

    await connection.commit();

    const { link: verificationLink } = generateEmailVerificationLink(user_id);
    await sendVerificationEmail(req.body.email, verificationLink);

    res.status(201).json({ message: "User registered successfully. Please verify your email. The link will expire in 1h", user_id });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

export async function verifyEmailService(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    if (typeof decoded === "string" || !decoded.user_id) {
      return next(new Error("Invalid token"));
    }

    if (decoded.type !== "email_verification") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user_id = decoded.user_id;

    // Verify User does exists + is NOT already verified 
    const q1 = "SELECT isVerified FROM users WHERE user_id = ?"
    const [rows] =  await pool.query(q1, [user_id]) as [RowDataPacket[], FieldPacket[]];;
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

export async function resetPasswordReqService(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Check user exists
    const q = "SELECT user_id FROM users WHERE user_email = ?";
    const [rows] = await pool.query(q, [email]) as [RowDataPacket[], FieldPacket[]];
    if (rows.length === 0) {
      return res.status(404).json({ message: "No user with that email" });
    }

    const user_id = rows[0].user_id;

    // 2. Generate a secure token
    const { link: resetLink } = generatePasswordResetLink(user_id);
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    return next(err);
  }
}

export async function resetPasswordService(req: Request, res: Response, next: NextFunction) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);

    if (typeof decoded === "string" || !decoded.user_id) {
      return next(new Error("Invalid token"));
    }

    if (decoded.type !== "password_reset") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user_id = decoded.user_id;

    const [rows] = await pool.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    ) as [RowDataPacket[], FieldPacket[]];

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await pool.query(
      "UPDATE users_credentials SET user_password_hash = ? WHERE user_id = ?",
      [hashedPassword, user_id]
    );

    return res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(410).json({ message: "Password reset link expired" });
    }
    return next(err);
  }
}


export async function logoutService(req: Request, res: Response, next: NextFunction) {

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  let decodedRefreshToken: JwtPayload | string;
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  if (typeof decodedRefreshToken === "string" || !decodedRefreshToken.exp) {
    return next(new Error("Invalid token"));
  }
  
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresIn = decodedRefreshToken.exp - nowInSeconds;
    await authRedis.set(refreshToken, 'revoked', { EX: expiresIn });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
}

  
// Login functionality implemented using JWTs
export async function loginService (req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body; 
    try {
        // Check if user exists with the provided username
        const q1 = `
          SELECT users.* , roles.role_name
          FROM users 
          JOIN roles ON users.role_id = roles.role_id
          WHERE user_email = ?;
        `
        const [data1] = await pool.query(q1 ,[email]) as [RowDataPacket[], FieldPacket[]];;
        if (data1.length === 0) return next(new Error("This email does not exist"));
        const user = data1[0]
        const { user_id } = user;

        // Check if user is verified, if not send email verification link again to thier email
        if (!user.isVerified){
          const { link: verificationLink } = generateEmailVerificationLink(user_id);
          await sendVerificationEmail(req.body.email, verificationLink);

          return next(new Error("Account not verified, please verify your email before logging in, another email has been sent to you with the verification link"));
        }          

        // Get the user's password hash
        const q2 = "SELECT user_password_hash FROM users_credentials WHERE user_id = ?";
        const [data2] = await pool.query(q2 ,[user.user_id]) as [RowDataPacket[], FieldPacket[]];
        if (data2.length === 0) return next(new Error("No credentials found for this user... desync in the database?"));
        const passwordHash = data2[0].user_password_hash;

        //Check the hash
        const isPasswordValid = bcrypt.compareSync(password, passwordHash);
        if (!isPasswordValid) return next(new Error("Invalid password"));

        // create new token with same token version from user DB query
        // const { accessToken, refreshToken } = generateTokens(user.user_id, user.role_id, user.role_name, user.refresh_token_version);
        const accessToken = signAccessToken(user.user_id, user.role_id, user.role_name);
        const refreshToken = signRefreshToken(user.user_id, user.refresh_token_version);
        
        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        res.status(200).json({
          user_id: user.user_id,
          user_name: user.user_name,
          user_email: user.user_email,
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
          role_name: user.role_name,
          isVerified: user.isVerified,
          accessToken,
          // refreshToken removed from response - now in HTTP-only cookie
        });
    }catch (error) {
        return next(error);
    }

}



export async function refreshService(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const isRevoked = await authRedis.exists(refreshToken);
    if (isRevoked) {
      return res.status(403).json({ message: "Refresh token revoked (logged out)" });
    }

    let decodedRefresh: JwtPayload;
    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET) as JwtPayload;
    } catch (err) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    const q = `
      SELECT users.*, users.refresh_token_version, roles.role_name
      FROM users JOIN roles ON users.role_id = roles.role_id
      WHERE user_id = ?
    `;
    const [rows] = await pool.query(q, [decodedRefresh.user_id]) as [RowDataPacket[], FieldPacket[]];
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    const user = rows[0];

    if (user.refresh_token_version !== decodedRefresh.token_version) {
      return res.status(401).json({ message: "Token version mismatch" });
    }

    const accessToken = signAccessToken(user.user_id, user.role_id, user.role_name);

    res.status(200).json({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      role_name: user.role_name,
      isVerified: user.isVerified,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
}


export async function addUserService(req: Request, res: Response, next: NextFunction) {
  if (!req.body.username || !req.body.email || !req.body.password) {
    return next(new Error("Username, Email and password are required"));
  }

  const connection = await pool.getConnection();
  try {
    const q1 = "SELECT * FROM users WHERE user_name = ?";
    const [data] = await connection.query(q1, [req.body.username]) as [UserRow[], FieldPacket[]];
    if (data.length !== 0) return next(new Error("Username already exists"));

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    await connection.beginTransaction();

    const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?,?,?,?,?,?)";
    const values2 = [
      req.body.username,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.role_id,
      1,
    ];
    const [result] = await connection.query(q2, values2) as [ResultSetHeader, FieldPacket[]];

    const user_id = result.insertId;

    const q3 = "INSERT INTO users_credentials (user_id, user_password_hash) VALUES (?,?)";
    await connection.query(q3, [user_id, hashedPassword]);

    await connection.commit();

    res.status(201).json({ message: "User added successfully", user_id });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}