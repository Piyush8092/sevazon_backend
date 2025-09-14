#!/usr/bin/env node

/**
 * Test script for Agora Service
 * Tests token generation and service status in different modes
 */

require('dotenv').config();
const agoraService = require('../services/agoraService');

console.log('🧪 Testing Agora Service...\n');

// Test 1: Service Status
console.log('📊 Test 1: Service Status');
console.log('=' .repeat(50));
try {
  const status = agoraService.getStatus();
  console.log('✅ Service Status:', JSON.stringify(status, null, 2));
} catch (error) {
  console.error('❌ Service Status Error:', error.message);
}

console.log('\n');

// Test 2: Token Generation
console.log('🔑 Test 2: Token Generation');
console.log('=' .repeat(50));
try {
  const tokenData = agoraService.generateToken('test_channel_123', 'user_123', 'publisher');
  console.log('✅ Token Generation Result:');
  console.log(JSON.stringify(tokenData, null, 2));
  
  // Verify token structure
  const requiredFields = ['token', 'channelName', 'userId', 'uid', 'expiresAt', 'appId', 'certificateStatus', 'developmentMode'];
  const missingFields = requiredFields.filter(field => !(field in tokenData));
  
  if (missingFields.length === 0) {
    console.log('✅ All required fields present in token response');
  } else {
    console.log('⚠️ Missing fields:', missingFields);
  }
  
} catch (error) {
  console.error('❌ Token Generation Error:', error.message);
}

console.log('\n');

// Test 3: Call Initiation
console.log('📞 Test 3: Call Initiation');
console.log('=' .repeat(50));
try {
  const callData = agoraService.initiateCall('caller_123', 'callee_456', 'video');
  console.log('✅ Call Initiation Result:');
  console.log(`Call ID: ${callData.callId}`);
  console.log(`Channel: ${callData.channelName}`);
  console.log(`Status: ${callData.status}`);
  console.log(`Type: ${callData.callType}`);
  console.log(`Caller Token Status: ${callData.caller.certificateStatus}`);
  console.log(`Callee Token Status: ${callData.callee.certificateStatus}`);
  
  // Test call answer
  console.log('\n📞 Test 3a: Answer Call');
  const answeredCall = agoraService.answerCall(callData.callId, 'callee_456');
  console.log(`✅ Call answered, status: ${answeredCall.status}`);
  
  // Test call end
  console.log('\n📞 Test 3b: End Call');
  const endedCall = agoraService.endCall(callData.callId, 'caller_123');
  console.log(`✅ Call ended, status: ${endedCall.status}`);
  
} catch (error) {
  console.error('❌ Call Management Error:', error.message);
}

console.log('\n');

// Test 4: Environment Information
console.log('🌍 Test 4: Environment Information');
console.log('=' .repeat(50));
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`AGORA_APP_ID: ${process.env.AGORA_APP_ID || 'not set'}`);
console.log(`AGORA_APP_CERTIFICATE: ${process.env.AGORA_APP_CERTIFICATE ? 'configured' : 'not set'}`);
console.log(`AGORA_APP_CERTIFICATE_BACKUP: ${process.env.AGORA_APP_CERTIFICATE_BACKUP ? 'configured' : 'not set'}`);

console.log('\n');

// Test 5: Multiple Token Generation (Performance Test)
console.log('⚡ Test 5: Multiple Token Generation');
console.log('=' .repeat(50));
const startTime = Date.now();
const tokenCount = 10;

try {
  for (let i = 0; i < tokenCount; i++) {
    agoraService.generateToken(`test_channel_${i}`, `user_${i}`, 'publisher');
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Generated ${tokenCount} tokens in ${duration}ms`);
  console.log(`⚡ Average: ${(duration / tokenCount).toFixed(2)}ms per token`);
  
} catch (error) {
  console.error('❌ Performance Test Error:', error.message);
}

console.log('\n🎉 Agora Service Test Complete!');
