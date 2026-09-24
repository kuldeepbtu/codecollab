import Room from "../models/Room.js";
import User from "../models/User.js";
import JoinRequest from "../models/JoinRequest.js";
import generateRoomId from "../utils/generateRoomId.js";

const generateUniqueRoomId = async () => {
  let roomId;
  let existingRoom = null;

  do {
    roomId = generateRoomId();
    existingRoom = await Room.findOne({ roomId });
  } while (existingRoom);

  return roomId;
};

export const createRoomService = async ({
  userId,
  accessMode = "open",
  language = "cpp",
  code = "",
  input = "",
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Authenticated user not found");
  }

  const roomId = await generateUniqueRoomId();

  const room = await Room.create({
  roomId,
  adminUserId: user._id,
  adminUsername: user.name,

  accessMode,
  language,

  code,
  input,

  allowedUsers: [],

  participants: [
    {
      userId: user._id,
      username: user.name,
      role: "admin",
      online: false,
      canEdit: true,
      socketId: "",
    },
  ],

  isSessionActive: true,
  lastSessionStartedAt: new Date(),
  lastSessionEndedAt: null,
});

  return room;
};

export const getRoomByRoomIdService = async (roomId) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
};

export const joinRoomService = async ({ roomId, userId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Authenticated user not found");
  }

  const isAdmin = room.adminUserId.toString() === userId;

  // Admin can always join
  if (isAdmin) {
    return {
      joinType: "direct",
      message: "Admin can join room directly",
      room,
    };
  }

  // If session is closed, non-admin cannot join
  if (!room.isSessionActive) {
    throw new Error("Room session is currently closed by admin");
  }

  // Open room -> direct join
  if (room.accessMode === "open") {
    return {
      joinType: "direct",
      message: "You can join this room directly",
      room,
    };
  }

  // Approval room -> check if already approved
  const isAlreadyApproved = room.allowedUsers.some(
    (allowedUser) => allowedUser.userId.toString() === userId
  );

  if (isAlreadyApproved) {
    return {
      joinType: "approved",
      message: "You are already approved for this room",
      room,
    };
  }

  // Check if a pending request already exists
  const existingPendingRequest = await JoinRequest.findOne({
    room: room._id,
    requesterUserId: userId,
    status: "pending",
  });

  if (existingPendingRequest) {
    return {
      joinType: "approval_required",
      message: "Your join request is already pending admin approval",
      room,
    };
  }

  // Create new pending request
  await JoinRequest.create({
    room: room._id,
    roomId: room.roomId,
    requesterUserId: user._id,
    requesterUsername: user.name,
    status: "pending",
  });

  return {
    joinType: "approval_required",
    message: "Join request sent to room admin",
    room,
  };
};

export const getPendingJoinRequestsService = async ({ roomId, adminUserId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can view join requests");
  }

  const requests = await JoinRequest.find({
    room: room._id,
    status: "pending",
  }).sort({ createdAt: -1 });

  return {
    room,
    requests,
  };
};

export const handleJoinRequestService = async ({
  roomId,
  requestId,
  adminUserId,
  action,
}) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can manage join requests");
  }

  if (!["approve", "reject"].includes(action)) {
    throw new Error("Action must be either approve or reject");
  }

  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    room: room._id,
  });

  if (!joinRequest) {
    throw new Error("Join request not found");
  }

  if (joinRequest.status !== "pending") {
    throw new Error(`Join request is already ${joinRequest.status}`);
  }

  if (action === "approve") {
    const alreadyApproved = room.allowedUsers.some(
      (allowedUser) =>
        allowedUser.userId.toString() === joinRequest.requesterUserId.toString()
    );

    if (!alreadyApproved) {
      room.allowedUsers.push({
        userId: joinRequest.requesterUserId,
        username: joinRequest.requesterUsername,
        approvedAt: new Date(),
      });
const alreadyParticipant = room.participants.some(
  (participant) =>
    participant.userId.toString() ===
    joinRequest.requesterUserId.toString()
);

if (!alreadyParticipant) {
  room.participants.push({
    userId: joinRequest.requesterUserId,
    username: joinRequest.requesterUsername,
    role: "member",
    online: false,
    canEdit: true,
    socketId: "",
  });
}
      await room.save();
    }

    joinRequest.status = "approved";
    await joinRequest.save();
    
    return {
      message: "Join request approved successfully",
      request: joinRequest,
    };
  }

  joinRequest.status = "rejected";
  await joinRequest.save();
  
  return {
    message: "Join request rejected successfully",
    request: joinRequest,
  };
};

export const getApprovedUsersService = async ({ roomId, adminUserId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can view approved users");
  }

  return {
    room,
    approvedUsers: room.allowedUsers,
  };
};

export const removeApprovedUserService = async ({
  roomId,
  targetUserId,
  adminUserId,
}) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can remove approved users");
  }

  if (targetUserId === adminUserId) {
    throw new Error("Admin cannot remove themselves from their own room");
  }

  const userExistsInAllowedList = room.allowedUsers.some(
    (allowedUser) => allowedUser.userId.toString() === targetUserId
  );

  if (!userExistsInAllowedList) {
    throw new Error("User is not in approved users list");
  }

  room.allowedUsers = room.allowedUsers.filter(
    (allowedUser) => allowedUser.userId.toString() !== targetUserId
  );

  await room.save();

  return {
    message: "Approved user removed successfully",
    approvedUsers: room.allowedUsers,
  };
};

// ======================
// START SESSION
// ======================

export const startSessionService = async ({ roomId, adminUserId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can start the session");
  }

  if (room.isSessionActive) {
    throw new Error("Session is already active");
  }

  room.isSessionActive = true;
  room.lastSessionStartedAt = new Date();

  await room.save();

  return room;
};

// ======================
// END SESSION
// ======================

export const endSessionService = async ({ roomId, adminUserId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can end the session");
  }

  if (!room.isSessionActive) {
    throw new Error("Session is already closed");
  }

  room.isSessionActive = false;
  room.lastSessionEndedAt = new Date();

  await room.save();

  return room;
};

// ======================
// DELETE ROOM
// ======================

export const deleteRoomService = async ({ roomId, adminUserId }) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.adminUserId.toString() !== adminUserId) {
    throw new Error("Only room admin can delete the room");
  }

  // delete all join requests
  await JoinRequest.deleteMany({
    room: room._id,
  });

  // delete room
  await Room.deleteOne({
    _id: room._id,
  });

  return;
};

export const getMyRoomsService = async (userId) => {
  const rooms = await Room.find({
    adminUserId: userId,
  })
    .sort({ createdAt: -1 })
    .select(
      "roomId accessMode language createdAt participants isSessionActive"
    );

  return rooms;
};