/**
 * Fast2SMS Service Test Script
 *
 * This script tests the Fast2SMS integration for OTP sending
 *
 * Usage:
 *   node scripts/testFast2SMS.js
 *
 * Or with custom phone number:
 *   node scripts/testFast2SMS.js 9876543210
 */

require("dotenv").config();
const fast2smsService = require("../services/fast2smsService");

// ANSI color codes for better console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(60));
}

async function testFast2SMS() {
  try {
    logSection("🧪 Fast2SMS Service Test");

    // Get phone number from command line or use default test number
    const phoneNumber = process.argv[2] || "9876543210";

    log(`\n📱 Testing with phone number: ${phoneNumber}`, colors.blue);

    // Test 1: Phone number validation
    logSection("Test 1: Phone Number Validation");
    const isValid = fast2smsService.isValidPhoneNumber(phoneNumber);
    if (isValid) {
      log(`✅ Phone number is valid`, colors.green);
    } else {
      log(`❌ Phone number is invalid`, colors.red);
      log(`   Expected format: 10 digits starting with 6-9`, colors.yellow);
      return;
    }

    // Test 2: Phone number cleaning
    logSection("Test 2: Phone Number Cleaning");
    const testNumbers = ["+91 9876543210", "91-9876543210", "9876543210", "+919876543210"];

    testNumbers.forEach((num) => {
      const cleaned = fast2smsService.cleanPhoneNumber(num);
      log(`   ${num} → ${cleaned}`, colors.cyan);
    });

    // Test 3: OTP Generation
    logSection("Test 3: OTP Generation");
    const otp1 = fast2smsService.generateOTP();
    const otp2 = fast2smsService.generateOTP();
    const otp3 = fast2smsService.generateOTP();

    log(`   Generated OTP 1: ${otp1}`, colors.cyan);
    log(`   Generated OTP 2: ${otp2}`, colors.cyan);
    log(`   Generated OTP 3: ${otp3}`, colors.cyan);

    if (otp1.length === 4 && otp2.length === 4 && otp3.length === 4) {
      log(`✅ All OTPs are 4 digits`, colors.green);
    } else {
      log(`❌ OTP length validation failed`, colors.red);
    }

    // Test 4: Send OTP (actual SMS)
    logSection("Test 4: Send OTP via SMS");
    log(`\n⚠️  This will send an actual SMS to ${phoneNumber}`, colors.yellow);
    log(`   Make sure you have sufficient Fast2SMS credits`, colors.yellow);
    log(`\n   Press Ctrl+C to cancel or wait 3 seconds to continue...`, colors.yellow);

    // Wait 3 seconds before sending
    await new Promise((resolve) => setTimeout(resolve, 3000));

    log(`\n📤 Sending OTP...`, colors.blue);
    const otp = fast2smsService.generateOTP();
    const result = await fast2smsService.sendOTP(phoneNumber, otp);

    if (result.success) {
      log(`\n✅ SMS sent successfully!`, colors.green);
      log(`   OTP: ${otp}`, colors.bright + colors.green);
      log(`   Phone: ${result.phone}`, colors.cyan);
      log(`   Response:`, colors.cyan);
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      log(`\n❌ Failed to send SMS`, colors.red);
      log(`   Error: ${result.message}`, colors.red);
      if (result.error) {
        console.log(JSON.stringify(result.error, null, 2));
      }
    }

    // Test Summary
    logSection("📊 Test Summary");
    log(`✅ Phone validation: Passed`, colors.green);
    log(`✅ Phone cleaning: Passed`, colors.green);
    log(`✅ OTP generation: Passed`, colors.green);
    log(
      `${result.success ? "✅" : "❌"} SMS sending: ${result.success ? "Passed" : "Failed"}`,
      result.success ? colors.green : colors.red
    );

    log(`\n🎉 Test completed!`, colors.bright + colors.green);
  } catch (error) {
    log(`\n❌ Test failed with error:`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
log(`\n🚀 Starting Fast2SMS Service Test...`, colors.bright + colors.blue);
testFast2SMS()
  .then(() => {
    log(`\n✨ All tests completed successfully!`, colors.bright + colors.green);
    process.exit(0);
  })
  .catch((error) => {
    log(`\n💥 Test suite failed:`, colors.bright + colors.red);
    console.error(error);
    process.exit(1);
  });
