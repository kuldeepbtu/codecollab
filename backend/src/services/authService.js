import bcrypt from "bcryptjs";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

// Provision the public demo account from Render environment variables.
// Never store the demo password in source control.
export const seedDemoUserService = async () => {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    console.log("Demo account seeding skipped: DEMO_EMAIL or DEMO_PASSWORD is not configured.");
    return;
  }

  if (password.length < 6) {
    throw new Error("DEMO_PASSWORD must contain at least 6 characters.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { $set: { name: "CodeCollab Demo", email, password: hashedPassword } },
    { upsert: true, new: true, runValidators: true }
  );
  console.log(`Demo account is ready: ${email}`);
};

export const signupUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};