const connectedUsers = new Map();

export const addUser = (userId, socketId, roomId) => {
  connectedUsers.set(socketId, {
    userId,
    roomId,
  });
};

export const removeUser = (socketId) => {
  connectedUsers.delete(socketId);
};

export const getUsersInRoom = (roomId) => {
  return [...connectedUsers.values()].filter(
    (user) => user.roomId === roomId
  );
};