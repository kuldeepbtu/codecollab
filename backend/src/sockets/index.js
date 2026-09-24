import registerRoomSocket from "./roomSocket.js";
import { SOCKET_EVENTS } from "../../../shared/socketEvents.js";

const initializeSocket = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerRoomSocket(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;