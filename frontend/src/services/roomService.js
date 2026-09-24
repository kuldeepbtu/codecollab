import api from "../api/axios";

export const createRoom = async (data) => {
  const res = await api.post("/api/rooms", data);
  return res.data;
};

export const joinRoom = async (roomId) => {
  const res = await api.post(`/api/rooms/${roomId}/join`);
  return res.data;
};

export const getRoom = async (roomId) => {
  const res = await api.get(`/api/rooms/${roomId}`);
  return res.data;
};

export const getMyRooms = async () => {
  const res = await api.get("/api/rooms/my");
  return res.data.rooms;
};