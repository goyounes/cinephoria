import jwt from "jsonwebtoken";

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