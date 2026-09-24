import {
  createRoomService,
  getRoomByRoomIdService,
  joinRoomService,
  getPendingJoinRequestsService,
  handleJoinRequestService,
  getApprovedUsersService,
  removeApprovedUserService,
  startSessionService,
endSessionService,
deleteRoomService,
getMyRoomsService,
} from "../services/roomService.js";

export const createRoomController = async (req, res) => {
  try {
    const { accessMode, language, code, input } = req.body;

    const room = await createRoomService({
      userId: req.user.userId,
      accessMode,
      language,
      code,
      input,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoomByRoomIdController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await getRoomByRoomIdService(roomId);

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      room,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinRoomController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await joinRoomService({
      roomId,
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      joinType: result.joinType,
      message: result.message,
      room: result.room,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingJoinRequestsController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await getPendingJoinRequestsService({
      roomId,
      adminUserId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Pending join requests fetched successfully",
      requests: result.requests,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleJoinRequestController = async (req, res) => {
  try {
    const { roomId, requestId } = req.params;
    const { action } = req.body;

    const result = await handleJoinRequestService({
      roomId,
      requestId,
      adminUserId: req.user.userId,
      action,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      request: result.request,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getApprovedUsersController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await getApprovedUsersService({
      roomId,
      adminUserId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Approved users fetched successfully",
      approvedUsers: result.approvedUsers,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeApprovedUserController = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    const result = await removeApprovedUserService({
      roomId,
      targetUserId: userId,
      adminUserId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      approvedUsers: result.approvedUsers,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const startSessionController = async (req, res) => {
  try {
    const room = await startSessionService({
      roomId: req.params.roomId,
      adminUserId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Room session started successfully",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const endSessionController = async (req, res) => {
  try {
    const room = await endSessionService({
      roomId: req.params.roomId,
      adminUserId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Room session ended successfully",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRoomController = async (req, res) => {
  try {
    await deleteRoomService({
      roomId: req.params.roomId,
      adminUserId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Room deleted permanently",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyRoomsController = async (req, res) => {
  try {
    const rooms = await getMyRoomsService(req.user.userId);

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
