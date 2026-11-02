import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/axios";

const SERVER_URL = API_BASE_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) return this.socket;

    this.socket = io(SERVER_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
