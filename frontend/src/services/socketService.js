import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL;

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