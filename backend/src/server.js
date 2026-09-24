import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT, CLIENT_URL } from "./config/env.js";
import initializeSocket from "./sockets/index.js";
import socketAuth from "./middleware/socketAuth.js";
const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
  });
io.use(socketAuth);
  initializeSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// Start server
startServer();