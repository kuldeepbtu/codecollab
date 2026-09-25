/**
 * Backend API Tests — Auth + Room endpoints
 * Run: npm test (from /backend)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;
let token;
let userId;
let testRoomId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 15000);

// ─── Auth Tests ──────────────────────────────────────────────────
describe("Auth API", () => {
  it("POST /api/auth/signup — creates a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@codecollab.dev",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe("Test User");

    token = res.body.token;
    userId = res.body.user.id;
  });

  it("POST /api/auth/signup — rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Duplicate User",
      email: "test@codecollab.dev",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login — logs in with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@codecollab.dev",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/auth/login — rejects invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@codecollab.dev",
      password: "wrongpassword",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/me — returns current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("test@codecollab.dev");
  });

  it("GET /api/auth/me — rejects without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});

// ─── Room Tests ──────────────────────────────────────────────────
describe("Room API", () => {
  it("POST /api/rooms — creates a new room", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        accessMode: "open",
        language: "javascript",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.room.roomId).toBeDefined();
    expect(res.body.room.language).toBe("javascript");
    expect(res.body.room.accessMode).toBe("open");

    testRoomId = res.body.room.roomId;
  });

  it("GET /api/rooms/:roomId — fetches room by ID", async () => {
    const res = await request(app).get(`/api/rooms/${testRoomId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.room.roomId).toBe(testRoomId);
  });

  it("GET /api/rooms/:roomId — returns 404 for unknown room", async () => {
    const res = await request(app).get("/api/rooms/nonexistent-id");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/rooms/my — returns user's rooms", async () => {
    const res = await request(app)
      .get("/api/rooms/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.rooms)).toBe(true);
    expect(res.body.rooms.length).toBeGreaterThan(0);
  });

  it("POST /api/rooms/:roomId/join — joins an open room", async () => {
    const res = await request(app)
      .post(`/api/rooms/${testRoomId}/join`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /api/rooms/:roomId — admin deletes room", async () => {
    const res = await request(app)
      .delete(`/api/rooms/${testRoomId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── AI Status Test ──────────────────────────────────────────────
describe("AI API", () => {
  it("GET /api/ai/status — returns provider status", async () => {
    const res = await request(app).get("/api/ai/status");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ai).toBeDefined();
    expect(res.body.ai.provider).toBeDefined();
  });
});

// ─── Health Check ────────────────────────────────────────────────
describe("Health API", () => {
  it("GET /api/health — returns healthy", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
  });
});
