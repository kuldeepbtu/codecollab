import verifyToken from "../utils/verifyToken.js";

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication failed. Token missing."));
    }

    socket.user = verifyToken(token);

    next();
  } catch (error) {
    next(new Error("Authentication failed. Invalid or expired token."));
  }
};

export default socketAuth;