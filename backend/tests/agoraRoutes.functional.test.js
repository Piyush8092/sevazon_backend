const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../model/userModel");

// Import routes and middleware
const agoraRoutes = require("../route/rout");
const authGuard = require("../middleware/auth");

// Create test app
const app = express();
app.use(express.json());
app.use(require("cookie-parser")());

// Mount routes
app.use("/api", agoraRoutes);

describe("Agora Routes Functional Tests", () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;
  let testCallId;

  beforeAll(async () => {
    try {
      // Connect to test database
      const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/savazon_test";
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to test database");

      // Clean up existing test data
      await userModel.deleteMany({ email: { $in: ["testuser@agora.com", "admin@agora.com"] } });

      // Create test users
      testUser = await userModel.create({
        name: "Test User",
        email: "testuser@agora.com",
        phone: `+1234567${Date.now().toString().slice(-3)}`,
        password: "password123",
        role: "GENERAL",
      });

      adminUser = await userModel.create({
        name: "Admin User",
        email: "admin@agora.com",
        phone: `+1234568${Date.now().toString().slice(-3)}`,
        password: "password123",
        role: "ADMIN",
      });

      // Generate JWT tokens
      userToken = jwt.sign(
        { id: testUser._id, email: testUser.email, role: testUser.role },
        process.env.SECRET_KEY || "me333enneffiimsqoqomcngfehdj3idss",
        { expiresIn: "1h" }
      );

      adminToken = jwt.sign(
        { id: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.SECRET_KEY || "me333enneffiimsqoqomcngfehdj3idss",
        { expiresIn: "1h" }
      );

      console.log("✅ Test data setup completed");
    } catch (error) {
      console.error("❌ Test setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Clean up test data
      await userModel.deleteMany({ email: { $in: ["testuser@agora.com", "admin@agora.com"] } });
      await mongoose.connection.close();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
    }
  });

  // Test helper functions
  const makeRequest = (method, endpoint, token = null, data = null) => {
    const req = request(app)[method](endpoint);

    if (token) {
      req.set("Cookie", [`jwt=${token}`]);
    }

    if (data) {
      req.send(data);
    }

    return req;
  };

  describe("Agora Service Status", () => {
    test("GET /api/agora/status - Get service status", async () => {
      const response = await makeRequest("get", "/api/agora/status");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("status", "healthy");
      expect(response.body.data).toHaveProperty("appId");
      expect(response.body.data).toHaveProperty("certificates");
      expect(response.body.data).toHaveProperty("tokenGeneration");
    });
  });

  describe("Token Generation", () => {
    test("POST /api/generate-call-token - Generate token successfully", async () => {
      const tokenData = {
        channelName: "test_channel_123",
        userId: "test_user_123",
        role: "publisher",
      };

      const response = await makeRequest("post", "/api/generate-call-token", null, tokenData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("channelName", tokenData.channelName);
      expect(response.body.data).toHaveProperty("userId", tokenData.userId);
      expect(response.body.data).toHaveProperty("uid");
      expect(response.body.data).toHaveProperty("appId");
    });

    test("POST /api/generate-call-token - Fail with invalid data", async () => {
      const response = await makeRequest("post", "/api/generate-call-token", null, {});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("POST /api/generate-call-token - Generate subscriber token", async () => {
      const tokenData = {
        channelName: "test_channel_subscriber",
        userId: "test_user_subscriber",
        role: "subscriber",
      };

      const response = await makeRequest("post", "/api/generate-call-token", null, tokenData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
    });
  });

  describe("Call Management", () => {
    test("POST /api/initiate-call - Initiate call successfully", async () => {
      const callData = {
        calleeId: adminUser._id.toString(),
        callType: "video",
      };

      const response = await makeRequest("post", "/api/initiate-call", userToken, callData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("callId");
      expect(response.body.data).toHaveProperty("channelName");
      expect(response.body.data).toHaveProperty("status", "initiated");
      expect(response.body.data).toHaveProperty("callType", "video");

      testCallId = response.body.data.callId;
    });

    test("POST /api/initiate-call - Fail without authentication", async () => {
      const callData = {
        calleeId: adminUser._id.toString(),
        callType: "voice",
      };

      const response = await makeRequest("post", "/api/initiate-call", null, callData);

      expect(response.status).toBe(401);
    });

    test("POST /api/initiate-call - Fail calling yourself", async () => {
      const callData = {
        calleeId: testUser._id.toString(),
        callType: "voice",
      };

      const response = await makeRequest("post", "/api/initiate-call", userToken, callData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Cannot call yourself");
    });

    test("GET /api/call/:callId - Get call information", async () => {
      if (!testCallId) {
        // Create a call first
        const callData = {
          calleeId: adminUser._id.toString(),
          callType: "voice",
        };
        const initResponse = await makeRequest("post", "/api/initiate-call", userToken, callData);
        testCallId = initResponse.body.data.callId;
      }

      const response = await makeRequest("get", `/api/call/${testCallId}`, userToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("callId", testCallId);
    });

    test("POST /api/answer-call/:callId - Answer call successfully", async () => {
      if (!testCallId) {
        // Create a call first
        const callData = {
          calleeId: adminUser._id.toString(),
          callType: "voice",
        };
        const initResponse = await makeRequest("post", "/api/initiate-call", userToken, callData);
        testCallId = initResponse.body.data.callId;
      }

      const response = await makeRequest("post", `/api/answer-call/${testCallId}`, adminToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("status", "active");
    });

    test("POST /api/end-call/:callId - End call successfully", async () => {
      if (!testCallId) {
        // Create and answer a call first
        const callData = {
          calleeId: adminUser._id.toString(),
          callType: "voice",
        };
        const initResponse = await makeRequest("post", "/api/initiate-call", userToken, callData);
        testCallId = initResponse.body.data.callId;
        await makeRequest("post", `/api/answer-call/${testCallId}`, adminToken);
      }

      const response = await makeRequest("post", `/api/end-call/${testCallId}`, userToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("status", "ended");
    });

    test("GET /api/call-history/:userId - Get call history", async () => {
      const response = await makeRequest("get", `/api/call-history/${testUser._id}`, userToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("activeCalls");
      expect(Array.isArray(response.body.data.activeCalls)).toBe(true);
    });
  });

  describe("Certificate Management", () => {
    test("POST /api/agora/reset-certificate - Reset to primary certificate", async () => {
      const response = await makeRequest("post", "/api/agora/reset-certificate", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("currentCertificate", "primary");
    });

    test("POST /api/agora/switch-certificate - Switch to backup certificate", async () => {
      const response = await makeRequest("post", "/api/agora/switch-certificate", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("currentCertificate", "backup");
    });
  });

  describe("Error Handling", () => {
    test("GET /api/call/invalid-uuid - Invalid call ID format", async () => {
      const response = await makeRequest("get", "/api/call/invalid-uuid", userToken);

      expect(response.status).toBe(400);
    });

    test("POST /api/answer-call/00000000-0000-0000-0000-000000000000 - Non-existent call", async () => {
      const response = await makeRequest(
        "post",
        "/api/answer-call/00000000-0000-0000-0000-000000000000",
        userToken
      );

      expect(response.status).toBe(404);
    });
  });
});
