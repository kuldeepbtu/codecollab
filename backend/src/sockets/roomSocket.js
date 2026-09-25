import { SOCKET_EVENTS } from "../../../shared/socketEvents.js";
import {
  userJoinedRoom,
  userLeftRoom,
} from "../services/socketRoomService.js";

import Room from "../models/Room.js";

const registerRoomSocket = (io, socket) => {
  socket.on(
    SOCKET_EVENTS.JOIN_ROOM,
    async ({ roomId, username }) => {
      // Find room
      const room = await Room.findOne({ roomId });

      if (!room) {
        socket.emit("join-error", {
          message: "Room not found",
        });
        return;
      }

      // Check if user is admin
      const isAdmin =
        room.adminUserId.toString() === socket.user.userId.toString();

      // Non-admin checks
      if (!isAdmin) {
        // Session closed
        if (!room.isSessionActive) {
          socket.emit("join-error", {
            message: "Room session is closed by admin.",
          });
          return;
        }

        // Approval mode
        if (room.accessMode === "approval") {
          const approved = room.allowedUsers.some(
            (user) =>
              user.userId.toString() ===
              socket.user.userId.toString()
          );

          if (!approved) {
            socket.emit("join-error", {
              message: "You are not approved to join this room.",
            });
            return;
          }
        }
      }

      // User is allowed
      socket.join(roomId);

      const updatedRoom = await userJoinedRoom(
        roomId,
        socket.user.userId,
        username,
        socket.id
      );

      if (!updatedRoom) return;

      io.to(roomId).emit(
        SOCKET_EVENTS.PARTICIPANTS_UPDATED,
        updatedRoom.participants
      );

      io.to(roomId).emit(
        SOCKET_EVENTS.USER_JOINED,
        {
          username,
        }
      );

      // Send initial room code and language to joining client
      socket.emit(SOCKET_EVENTS.SYNC_ROOM_STATE, {
        code: room.code || "",
        language: room.language || "javascript",
      });

      console.log(`${username} joined room ${roomId}`);
    }
  );

  socket.on(SOCKET_EVENTS.CODE_CHANGE, async ({ roomId, code }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.CODE_CHANGE, code);
    // Debounce save or update room document
    try {
      await Room.updateOne({ roomId }, { code });
    } catch (e) {
      console.error("Error saving code change:", e);
    }
  });

  socket.on(SOCKET_EVENTS.LANGUAGE_CHANGE, async ({ roomId, language }) => {
    io.to(roomId).emit(SOCKET_EVENTS.LANGUAGE_CHANGE, language);
    try {
      await Room.updateOne({ roomId }, { language });
    } catch (e) {
      console.error("Error saving language change:", e);
    }
  });

  socket.on(
    SOCKET_EVENTS.LEAVE_ROOM,
    async ({ roomId, username }) => {
      socket.leave(roomId);

      const room = await userLeftRoom(
        roomId,
        socket.id
      );

      if (room) {
        io.to(roomId).emit(
          SOCKET_EVENTS.PARTICIPANTS_UPDATED,
          room.participants
        );
      }

      io.to(roomId).emit(
        SOCKET_EVENTS.USER_LEFT,
        {
          username,
        }
      );

      console.log(`${username} left room ${roomId}`);
    }
  );

  socket.on("disconnecting", async () => {
    const rooms = [...socket.rooms];

    for (const roomId of rooms) {
      if (roomId === socket.id) continue;

      const room = await userLeftRoom(
        roomId,
        socket.id
      );

      if (room) {
        io.to(roomId).emit(
          SOCKET_EVENTS.PARTICIPANTS_UPDATED,
          room.participants
        );
      }
    }

    console.log(`${socket.id} disconnected`);
  });
};

export default registerRoomSocket;