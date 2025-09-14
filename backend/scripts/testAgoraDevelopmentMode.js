#!/usr/bin/env node

/**
 * Test script for Agora Service Development Mode
 * Tests behavior when certificates are not configured
 */

// Temporarily remove certificates to test development mode
const originalCert = process.env.AGORA_APP_CERTIFICATE;
const originalBackup = process.env.AGORA_APP_CERTIFICATE_BACKUP;

// Clear certificates
delete process.env.AGORA_APP_CERTIFICATE;
delete process.env.AGORA_APP_CERTIFICATE_BACKUP;

require('dotenv').config();

console.log('🧪 Testing Agora Service in Development Mode (No Certificates)...\n');

// Import service after clearing environment variables
const agoraService = require('../services/agoraService');

// Test 1: Service Status in Development Mode
console.log('📊 Test 1: Service Status (Development Mode)');
console.log('=' .repeat(50));
try {
  const status = agoraService.getStatus();
  console.log('✅ Service Status:', JSON.stringify(status, null, 2));
} catch (error) {
  console.error('❌ Service Status Error:', error.message);
}

console.log('\n');

// Test 2: Token Generation in Development Mode
console.log('🔑 Test 2: Token Generation (Development Mode)');
console.log('=' .repeat(50));
try {
  const tokenData = agoraService.generateToken('test_channel_dev', 'user_dev', 'publisher');
  console.log('✅ Token Generation Result (Development Mode):');
  console.log(JSON.stringify(tokenData, null, 2));
  
  // Verify development mode fields
  if (tokenData.developmentMode === true) {
    console.log('✅ Development mode correctly detected');
  } else {
    console.log('⚠️ Development mode not detected');
  }
  
  if (tokenData.token === null) {
    console.log('✅ Null token correctly returned for development');
  } else {
    console.log('⚠️ Expected null token in development mode');
  }
  
} catch (error) {
  console.error('❌ Token Generation Error:', error.message);
}

console.log('\n');

// Test 3: Call Initiation in Development Mode
console.log('📞 Test 3: Call Initiation (Development Mode)');
console.log('=' .repeat(50));
try {
  const callData = agoraService.initiateCall('dev_caller', 'dev_callee', 'voice');
  console.log('✅ Call Initiation Result (Development Mode):');
  console.log(`Call ID: ${callData.callId}`);
  console.log(`Channel: ${callData.channelName}`);
  console.log(`Status: ${callData.status}`);
  console.log(`Caller Development Mode: ${callData.caller.developmentMode}`);
  console.log(`Callee Development Mode: ${callData.callee.developmentMode}`);
  console.log(`Caller Token: ${callData.caller.token === null ? 'null (correct)' : 'not null (unexpected)'}`);
  console.log(`Callee Token: ${callData.callee.token === null ? 'null (correct)' : 'not null (unexpected)'}`);
  
} catch (error) {
  console.error('❌ Call Management Error:', error.message);
}

console.log('\n');

// Test 4: Environment Information
console.log('🌍 Test 4: Environment Information (Development Mode)');
console.log('=' .repeat(50));
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`AGORA_APP_ID: ${process.env.AGORA_APP_ID || 'not set'}`);
console.log(`AGORA_APP_CERTIFICATE: ${process.env.AGORA_APP_CERTIFICATE || 'not set'}`);
console.log(`AGORA_APP_CERTIFICATE_BACKUP: ${process.env.AGORA_APP_CERTIFICATE_BACKUP || 'not set'}`);

console.log('\n🎉 Development Mode Test Complete!');

// Restore original certificates
if (originalCert) {
  process.env.AGORA_APP_CERTIFICATE = originalCert;
}
if (originalBackup) {
  process.env.AGORA_APP_CERTIFICATE_BACKUP = originalBackup;
}
