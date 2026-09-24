import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

const verifyToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  return {
    userId: decoded.userId,
  };
};

export default verifyToken;