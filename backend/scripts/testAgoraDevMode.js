#!/usr/bin/env node

/**
 * Test script for Agora Service Development Mode
 * Tests behavior when certificates are not configured
 */

// Set up environment without certificates
process.env.NODE_ENV = "development";
process.env.AGORA_APP_ID = "400bb82ebad34539aebcb6de61e5a976";
// Don't set AGORA_APP_CERTIFICATE or AGORA_APP_CERTIFICATE_BACKUP

console.log("🧪 Testing Agora Service in Development Mode (No Certificates)...\n");

// Import service after setting environment variables
const { RtcTokenBuilder, RtcRole } = require("agora-token");
const crypto = require("crypto");

// UUID replacement using Node.js built-in crypto
const uuidv4 = () => {
  return crypto.randomUUID();
};

/**
 * Agora Service for handling video/voice call functionality (Development Mode Test)
 */
class AgoraServiceTest {
  constructor() {
    // Agora App ID and App Certificate from environment variables
    this.appId = process.env.AGORA_APP_ID || "400bb82ebad34539aebcb6de61e5a976";
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;

    // For development, provide a fallback certificate if not set
    if (!this.appCertificate && process.env.NODE_ENV === "development") {
      // This is a placeholder certificate for development only
      console.warn(
        "⚠️ Using development fallback certificate. Set AGORA_APP_CERTIFICATE for production!"
      );
      this.appCertificate = "development_certificate_placeholder";
    }

    this.currentCertificate = this.appCertificate;

    // Token expiration time (24 hours)
    this.tokenExpirationInSeconds = 24 * 60 * 60;

    // In-memory storage for active calls
    this.activeCalls = new Map();

    console.log("🎥 AgoraService initialized");
    console.log(`📱 App ID: ${this.appId}`);
    console.log(`🔐 App Certificate: ${this.appCertificate ? "Configured" : "Not configured"}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  }

  generateToken(channelName, userId, role = "publisher") {
    try {
      // Convert string userId to numeric UID
      const uid = this.generateUid();

      // For development mode without proper certificate
      if (
        !this.currentCertificate ||
        this.currentCertificate === "development_certificate_placeholder"
      ) {
        console.warn("⚠️ Development mode: Using null token (certificate not properly configured)");
        return {
          token: null,
          channelName,
          userId,
          uid,
          expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
          appId: this.appId,
          certificateStatus: "not_configured",
          developmentMode: true,
        };
      }

      // This would normally generate a real token, but we won't reach here in dev mode
      return {
        token: "real_token_would_be_here",
        channelName,
        userId,
        uid,
        expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
        appId: this.appId,
        certificateStatus: "configured",
        developmentMode: false,
      };
    } catch (error) {
      console.error("❌ Error generating Agora token:", error);

      // Fallback for development
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Falling back to null token for development");
        return {
          token: null,
          channelName,
          userId,
          uid: this.generateUid(),
          expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
          appId: this.appId,
          certificateStatus: "error",
          developmentMode: true,
          error: error.message,
        };
      }

      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  generateUid() {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  getStatus() {
    const isDevelopmentMode = process.env.NODE_ENV === "development";
    const isUsingPlaceholder = this.currentCertificate === "development_certificate_placeholder";

    return {
      status: "healthy",
      appId: this.appId,
      environment: process.env.NODE_ENV || "development",
      developmentMode: isDevelopmentMode,
      certificates: {
        primary: {
          configured:
            !!this.appCertificate && this.appCertificate !== "development_certificate_placeholder",
          value:
            this.appCertificate && this.appCertificate !== "development_certificate_placeholder"
              ? `${this.appCertificate.substring(0, 8)}...`
              : null,
          isPlaceholder: this.appCertificate === "development_certificate_placeholder",
        },
        currentlyUsing: this.currentCertificate ? "primary" : "none",
        usingPlaceholder: isUsingPlaceholder,
      },
      tokenGeneration: {
        willGenerateNullTokens: !this.currentCertificate || isUsingPlaceholder,
        reason: !this.currentCertificate
          ? "No certificate configured"
          : isUsingPlaceholder
            ? "Using development placeholder certificate"
            : "Certificates properly configured",
      },
      activeCalls: this.activeCalls.size,
      timestamp: new Date(),
    };
  }
}

const agoraService = new AgoraServiceTest();

// Test 1: Service Status in Development Mode
console.log("📊 Test 1: Service Status (Development Mode)");
console.log("=".repeat(50));
try {
  const status = agoraService.getStatus();
  console.log("✅ Service Status:", JSON.stringify(status, null, 2));
} catch (error) {
  console.error("❌ Service Status Error:", error.message);
}

console.log("\n");

// Test 2: Token Generation in Development Mode
console.log("🔑 Test 2: Token Generation (Development Mode)");
console.log("=".repeat(50));
try {
  const tokenData = agoraService.generateToken("test_channel_dev", "user_dev", "publisher");
  console.log("✅ Token Generation Result (Development Mode):");
  console.log(JSON.stringify(tokenData, null, 2));

  // Verify development mode fields
  if (tokenData.developmentMode === true) {
    console.log("✅ Development mode correctly detected");
  } else {
    console.log("⚠️ Development mode not detected");
  }

  if (tokenData.token === null) {
    console.log("✅ Null token correctly returned for development");
  } else {
    console.log("⚠️ Expected null token in development mode");
  }
} catch (error) {
  console.error("❌ Token Generation Error:", error.message);
}

console.log("\n");

// Test 3: Environment Information
console.log("🌍 Test 3: Environment Information (Development Mode)");
console.log("=".repeat(50));
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(`AGORA_APP_ID: ${process.env.AGORA_APP_ID || "not set"}`);
console.log(`AGORA_APP_CERTIFICATE: ${process.env.AGORA_APP_CERTIFICATE || "not set"}`);

console.log("\n🎉 Development Mode Test Complete!");
