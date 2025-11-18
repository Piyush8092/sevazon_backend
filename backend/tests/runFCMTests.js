#!/usr/bin/env node

/**
 * Manual test runner for FCM Routes
 * This script can be used to run tests without Jest if needed
 * Run with: node tests/runFCMTests.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import the app and models
const fcmRoutes = require('../route/fcmRoutes');
const User = require('../model/userModel');
const FCMToken = require('../model/fcmTokenModel');
const NotificationPreferences = require('../model/notificationPreferencesModel');
const NotificationHistory = require('../model/notificationHistoryModel');

// Create test app
const app = express();
app.use(express.json());
app.use(require('cookie-parser')());
app.use('/api/fcm', fcmRoutes);

// Test data
let testUser, adminUser, userToken, adminToken;
let testFCMToken;

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/savazon_test');
        console.log('✅ Connected to test database');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

// Setup test users and tokens
const setupTestData = async () => {
    try {
        // Generate unique test token for this test run (must be 140+ chars and contain colon)
        const randomPart1 = 'test_fcm_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 20);
        const randomPart2 = Math.random().toString(36).substr(2, 20) + '_' + Date.now();
        const padding = 'A'.repeat(Math.max(0, 140 - randomPart1.length - randomPart2.length - 1));
        testFCMToken = randomPart1 + ':' + randomPart2 + padding;
        
        // Clean up existing test data
        await User.deleteMany({
            $or: [
                { email: { $in: ['testuser@example.com', 'admin@example.com'] } },
                { phone: { $in: ['1234567890', '0987654321'] } }
            ]
        });
        await FCMToken.deleteMany({});
        await NotificationPreferences.deleteMany({});
        await NotificationHistory.deleteMany({});

        // Create test user with unique phone
        const uniquePhone1 = '1234567' + Date.now().toString().slice(-3);
        testUser = await User.create({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            phone: uniquePhone1,
            role: 'GENERAL'
        });

        // Create admin user with unique phone
        const uniquePhone2 = '0987654' + Date.now().toString().slice(-3);
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            phone: uniquePhone2,
            role: 'ADMIN'
        });

        // Generate JWT tokens (using the correct secret and payload structure)
        userToken = jwt.sign(
            { id: testUser._id, email: testUser.email, role: testUser.role },
            process.env.SECRET_KEY || 'me333enneffiimsqoqomcngfehdj3idss',
            { expiresIn: '1h' }
        );

        adminToken = jwt.sign(
            { id: adminUser._id, email: adminUser.email, role: adminUser.role },
            process.env.SECRET_KEY || 'me333enneffiimsqoqomcngfehdj3idss',
            { expiresIn: '1h' }
        );

        console.log('✅ Test data setup completed');
    } catch (error) {
        console.error('❌ Test data setup failed:', error);
        throw error;
    }
};

// Test helper functions
const makeRequest = (method, endpoint, token = null, data = null) => {
    const req = request(app)[method](endpoint);

    if (token) {
        // Set token as cookie since the auth middleware expects it there
        req.set('Cookie', [`jwt=${token}`]);
    }

    if (data) {
        req.send(data);
    }

    return req;
};

// Simple test runner
const runTest = async (testName, testFunction) => {
    try {
        console.log(`\n🧪 Running: ${testName}`);
        await testFunction();
        console.log(`✅ PASSED: ${testName}`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: ${testName}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
};

// Test cases
const testFCMTokenRegistration = async () => {
    const tokenData = {
        token: testFCMToken,
        deviceInfo: {
            deviceId: 'test_device_' + Date.now(),
            deviceType: 'android',
            deviceModel: 'Test Device',
            osVersion: 'Android 12',
            appVersion: '1.0.0'
        }
    };

    const response = await makeRequest('post', '/api/fcm/token', userToken, tokenData);

    if (response.status !== 200) {
        console.log('Response body:', response.body);
        throw new Error(`Expected status 200, got ${response.status}. Error: ${response.body?.message || 'Unknown error'}`);
    }

    if (!response.body.success) {
        throw new Error(`Expected success: true, got ${response.body.success}`);
    }
};

const testGetUserTokens = async () => {
    const response = await makeRequest('get', '/api/fcm/tokens', userToken);
    
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.body.success) {
        throw new Error(`Expected success: true, got ${response.body.success}`);
    }
    
    if (!Array.isArray(response.body.data)) {
        throw new Error(`Expected data to be an array`);
    }
};

const testGetNotificationPreferences = async () => {
    const response = await makeRequest('get', '/api/fcm/preferences', userToken);
    
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.body.success) {
        throw new Error(`Expected success: true, got ${response.body.success}`);
    }
    
    if (!response.body.data.globalSettings) {
        throw new Error(`Expected globalSettings in response`);
    }
};

const testUnauthorizedAccess = async () => {
    const response = await makeRequest('get', '/api/fcm/tokens', null);
    
    if (response.status !== 401) {
        throw new Error(`Expected status 401, got ${response.status}`);
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting FCM Routes Manual Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    try {
        await connectDB();
        await setupTestData();
        
        // Run tests
        const tests = [
            ['FCM Token Registration', testFCMTokenRegistration],
            ['Get User Tokens', testGetUserTokens],
            ['Get Notification Preferences', testGetNotificationPreferences],
            ['Unauthorized Access', testUnauthorizedAccess]
        ];
        
        for (const [name, testFn] of tests) {
            const result = await runTest(name, testFn);
            if (result) {
                passed++;
            } else {
                failed++;
            }
        }
        
        console.log(`\n📊 Test Results:`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📈 Total: ${passed + failed}`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n⚠️  Some tests failed. Check the logs above for details.');
        }
        
    } catch (error) {
        console.error('❌ Test runner failed:', error);
    } finally {
        // Clean up test data
        try {
            await User.deleteMany({
                email: { $in: ['testuser@example.com', 'admin@example.com'] }
            });
            await FCMToken.deleteMany({});
            await NotificationPreferences.deleteMany({});
            await NotificationHistory.deleteMany({});
        } catch (cleanupError) {
            console.error('⚠️  Cleanup failed:', cleanupError.message);
        }
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(failed > 0 ? 1 : 0);
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    connectDB,
    setupTestData,
    makeRequest
};
