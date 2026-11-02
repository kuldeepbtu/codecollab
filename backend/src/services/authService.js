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

export const googleLoginService = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured on the server.");

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!response.ok) throw new Error("Google sign-in token could not be verified.");

  const profile = await response.json();
  if (
    profile.aud !== clientId ||
    profile.email_verified !== "true" ||
    !["accounts.google.com", "https://accounts.google.com"].includes(profile.iss)
  ) {
    throw new Error("Google account verification failed.");
  }

  const email = profile.email?.trim().toLowerCase();
  const name = profile.name?.trim() || email?.split("@")[0] || "Google User";
  if (!email) throw new Error("Google did not provide an email address.");

  let user = await User.findOne({ email });
  if (!user) {
    const randomPassword = await bcrypt.hash(
      (await import("crypto")).randomBytes(32).toString("hex"),
      10
    );
    user = await User.create({ name, email, password: randomPassword });
  }

  const token = generateToken(user);
  return {
    user: { id: user._id, name: user.name, email: user.email },
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