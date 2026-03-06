/**
 * Quick Test Script for CallHistory Implementation
 * Run this to verify the model and controller load correctly
 */

console.log("🔄 Testing CallHistory implementation...\n");

try {
  // Test 1: Load the model
  console.log("1️⃣ Loading CallHistoryModel...");
  const CallHistoryModel = require("./model/CallHistoryModel");
  console.log("✅ CallHistoryModel loaded successfully");
  console.log("   Model name:", CallHistoryModel.modelName);
  console.log("   Collection:", CallHistoryModel.collection.name);
  
  // Test 2: Load the controller
  console.log("\n2️⃣ Loading AgoraController...");
  const agoraController = require("./controllers/agora/agoraController");
  console.log("✅ AgoraController loaded successfully");
  console.log("   Has saveCallHistory method:", typeof agoraController.saveCallHistory === "function");
  console.log("   Has getUserCallHistory method:", typeof agoraController.getUserCallHistory === "function");
  console.log("   Has getCallHistory method:", typeof agoraController.getCallHistory === "function");
  
  // Test 3: Load the routes
  console.log("\n3️⃣ Loading CallRoutes...");
  const callRoutes = require("./route/callRoutes");
  console.log("✅ CallRoutes loaded successfully");
  
  console.log("\n✅ All components loaded successfully!");
  console.log("The server should be able to start without errors.");
  
} catch (error) {
  console.error("\n❌ ERROR:", error.message);
  console.error("\nStack trace:");
  console.error(error.stack);
  process.exit(1);
}
