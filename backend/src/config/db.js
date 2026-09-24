import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

let mongodInstance = null;

const startMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    console.log("Starting In-Memory MongoDB server...");
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log("In-Memory MongoDB connected successfully at:", uri);
  } catch (err) {
    console.error("Failed to start In-Memory MongoDB:", err.message);
    process.exit(1);
  }
};

const connectDB = async () => {
  if (process.env.USE_MEMORY_DB === "true") {
    await startMemoryDB();
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.warn(
      `MongoDB connection to ${MONGO_URI} failed (${error.message}). Falling back to In-Memory MongoDB...`
    );
    await startMemoryDB();
  }
};

process.on("SIGINT", async () => {
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  process.exit(0);
});

export default connectDB;