import {
  signupUserService,
  loginUserService,
  getCurrentUserService,
} from "../services/authService.js";

export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const data = await signupUserService({ name, email, password });

    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
      ...data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await loginUserService({ email, password });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      ...data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMeController = async (req, res) => {
  try {
    const user = await getCurrentUserService(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};