import { pool } from "../config/mysqlConnect.js";
import { getAuthRedis } from '../config/redisConnect.js';
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import {sendPasswordResetEmail, sendVerificationEmail } from "../api/emailClient.js";
import { generateEmailVerificationLink, generatePasswordResetLink } from "../utils/index.js";


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
        const { link: verificationLink } = generateEmailVerificationLink(user_id);
        await sendVerificationEmail(req.body.email, verificationLink);

        res.status(201).json({ message: "User registered successfully. Please verify your email. The link will expire in 1h", user_id });
    } catch (error) {
        await connection.rollback();
        next(error);
    }finally {
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
    // Check user exists
    const q = "SELECT user_id FROM users WHERE user_email = ?";
    const [rows] = await pool.query(q, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No user with that email" });
    }

    const user_id = rows[0].user_id;

    // 2. Generate a secure token
    const { link: resetLink } = generatePasswordResetLink(user_id);
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
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);

    if (decoded.type !== "password_reset") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user_id = decoded.user_id;

    // check user exists
    const [rows] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = bycrpt.genSaltSync(10);
    const hashedPassword = bycrpt.hashSync(newPassword, salt);

    // Update the password
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


export async function logoutService(req, res, next) {

  // Get refresh token from HTTP-only cookie instead of request body
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  let decodedRefreshToken
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
  
  try {
    // Add refreshToken to revoked list (blacklist)
    const client = await getAuthRedis();

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresIn = decodedRefreshToken.exp - nowInSeconds;
    await client.set(refreshToken, 'revoked', { EX: expiresIn });  //set support for expiration

    // Clear the HTTP-only cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}


// Login functionality implemented using JWTs
const ACCESS_JWT_EXPIRY = '15m';
const REFRESH_JWT_EXPIRY = '7d';

const generateTokens = (user_id, role_id, role_name, token_version) => {
  const accessToken = jwt.sign({ user_id, role_id, role_name}, process.env.ACCESS_JWT_SECRET, { expiresIn: ACCESS_JWT_EXPIRY });
  const refreshToken = jwt.sign({ user_id, token_version }, process.env.REFRESH_JWT_SECRET, { expiresIn: REFRESH_JWT_EXPIRY });
  return { accessToken, refreshToken };
};

export async function loginService (req, res, next) {
    const { email, password } = req.body; 
    try {
        // Check if user exists with the provided username
        const q1 = `
          SELECT users.* , roles.role_name
          FROM users 
          JOIN roles ON users.role_id = roles.role_id
          WHERE user_email = ?;
        `
        const [data1] = await pool.query(q1 ,[email]);
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
        const [data2] = await pool.query(q2 ,[user.user_id]);
        if (data2.length === 0) return next(new Error("No credentials found for this user... desync in the database?"));
        const passwordHash = data2[0].user_password_hash;

        //Check the hash
        const isPasswordValid = bycrpt.compareSync(password, passwordHash);
        if (!isPasswordValid) return next(new Error("Invalid password"));

        // create new token with same token version from user DB query
        const { accessToken, refreshToken } = generateTokens(user.user_id, user.role_id, user.role_name, user.refresh_token_version);

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
        next(error);
    }

}



// refresh functionality still under build

export async function refreshService(req, res, next) {
  try {
    // Get refresh token from HTTP-only cookie instead of request body
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({message: "Refresh token required"});

    // Check if refresh token is revoked (blacklisted)
    const client = await getAuthRedis();
    const isRevoked = await client.exists(refreshToken);

    if (isRevoked) {
      return res.status(403).json({ message: "Refresh token revoked (logged out)" });
    }

    // Verify access token first (MUST be valid signed token, just expired is okay)

    let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    } catch (err) {
      return res.status(400).json({message: "Invalid refresh token"});
    }


    // Check refresh token version matches
    const q = `
      SELECT users.*, users.refresh_token_version, roles.role_name
      FROM users JOIN roles ON users.role_id = roles.role_id
      WHERE user_id = ?
    `;
    const [rows] = await pool.query(q, [decodedRefresh.user_id]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    const user = rows[0];

    if (user.refresh_token_version !== decodedRefresh.token_version) {

      return res.status(401).json({message: "Token version mismatch"});
    }

    // Generate new access token
    const { accessToken } = generateTokens(
      user.user_id,
      user.role_id,
      user.role_name,
      user.refresh_token_version
    );

    // res.status(200).json({ accessToken: newAccessToken });
    res.status(200).json({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      role_name: user.role_name,
      isVerified: user.isVerified,
      accessToken, //new Access Token
      // refreshToken removed from response - now in HTTP-only cookie
    });
  } catch (error) {
    next(error);
  }
}



function createRoleMiddleware(roleCheckFunc) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No access token provided" });
      }
      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Access token expired" });
        }
        return res.status(400).json({ message: "Invalid access token" });
      }

      if (!roleCheckFunc(decoded.role_id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
      };

      next();
    } catch (error) {
      next(error)
    }
  };
}

export const verifyUserJWT = createRoleMiddleware((role_id) => role_id >= 1);   
export const verifyEmployeeJWT = createRoleMiddleware((role_id) => role_id >= 2);
export const verifyAdminJWT = createRoleMiddleware((role_id) => role_id === 3);

export async function addUserService (req, res, next) {
    // Validate request body
    if (!req.body.username || !req.body.password || !req.body.username ) {
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
        const q2 = "INSERT INTO users (user_name, user_email, first_name, last_name,role_id,isVerified) VALUES (?,?,?,?,?,?)";        const values2 = [
            req.body.username,
            req.body.email,
            req.body.firstName,
            req.body.lastName,
            req.body.role_id,
            1,  // Assuming new users are verified by default
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

        res.status(201).json({ message: "User added successfully", user_id });
    } catch (error) {
        await connection.rollback();
        next(error);
    }finally {
        if (connection) connection.release();
    }
}