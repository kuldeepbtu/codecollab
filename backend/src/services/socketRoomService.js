import Room from "../models/Room.js";

export const userJoinedRoom = async (
  roomId,
  userId,
  username,
  socketId
) => {
  console.log("========== userJoinedRoom ==========");
  console.log({ roomId, userId, username, socketId });

  const room = await Room.findOne({ roomId });

  console.log("Room Found:", room ? "YES" : "NO");

  if (!room) return null;

 const userIdString = String(userId);

let participant = room.participants.find(
  (p) => String(p.userId) === userIdString
);
  console.log("Existing participant:", participant);

  if (!participant) {
    console.log("Creating new participant...");

    participant = {
      userId,
      username,
      role:
        room.adminUserId.toString() === userId.toString()
          ? "admin"
          : "member",
      socketId,
      online: true,
      canEdit: true,
    };

    room.participants.push(participant);
  } else {
    console.log("Updating existing participant...");

    participant.online = true;
participant.socketId = socketId;
participant.username = username;
  }

  console.log("Participants BEFORE save:");
  console.log(room.participants);

  await room.save();

  console.log("Room saved successfully");

  return room;
};

export const userLeftRoom = async (roomId, socketId) => {
  const room = await Room.findOne({ roomId });

  if (!room) return null;

  const participant = room.participants.find(
    (p) => p.socketId === socketId
  );

  if (participant) {
    participant.online = false;
    participant.socketId = "";

    await room.save();
  }

  return room;
};