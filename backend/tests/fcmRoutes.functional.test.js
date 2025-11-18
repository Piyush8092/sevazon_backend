/**
 * Comprehensive Functional Tests for FCM Routes
 * Tests all FCM API endpoints with various scenarios
 * Run with: npm run test:fcm
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
        await User.deleteMany({ email: { $in: ['testuser@example.com', 'admin@example.com'] } });
        await FCMToken.deleteMany({});
        await NotificationPreferences.deleteMany({});
        await NotificationHistory.deleteMany({});

        // Create test user
        testUser = await User.create({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            phone: '1234567890',
            role: 'GENERAL'
        });

        // Create admin user
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            phone: '0987654321',
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

// Test suites
describe('FCM Routes Functional Tests', () => {
    
    beforeAll(async () => {
        await connectDB();
        await setupTestData();
    });

    afterAll(async () => {
        // Clean up test data
        await User.deleteMany({ email: { $in: ['testuser@example.com', 'admin@example.com'] } });
        await FCMToken.deleteMany({});
        await NotificationPreferences.deleteMany({});
        await NotificationHistory.deleteMany({});
        await mongoose.connection.close();
    });

    // ============================================================================
    // FCM TOKEN MANAGEMENT TESTS
    // ============================================================================

    describe('FCM Token Management', () => {
        
        test('POST /api/fcm/token - Register FCM token successfully', async () => {
            const tokenData = {
                token: testFCMToken,
                deviceInfo: {
                    deviceId: global.testUtils.generateTestDeviceId(),
                    deviceType: 'android',
                    deviceModel: 'Test Device',
                    osVersion: 'Android 12',
                    appVersion: '1.0.0'
                }
            };

            const response = await makeRequest('post', '/api/fcm/token', userToken, tokenData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBe(testFCMToken);
            expect(response.body.data.userId.toString()).toBe(testUser._id.toString());
        });

        test('POST /api/fcm/token - Update existing FCM token', async () => {
            const updatedTokenData = {
                token: testFCMToken,
                deviceInfo: {
                    deviceId: global.testUtils.generateTestDeviceId(),
                    deviceType: 'android',
                    deviceModel: 'Updated Test Device',
                    osVersion: 'Android 13',
                    appVersion: '1.1.0'
                }
            };

            const response = await makeRequest('post', '/api/fcm/token', userToken, updatedTokenData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('updated');
        });

        test('POST /api/fcm/token - Fail without authentication', async () => {
            const tokenData = {
                token: 'test_token_no_auth',
                deviceInfo: { deviceId: 'test_device' }
            };

            const response = await makeRequest('post', '/api/fcm/token', null, tokenData);
            
            expect(response.status).toBe(401);
        });

        test('GET /api/fcm/tokens - Get user tokens', async () => {
            const response = await makeRequest('get', '/api/fcm/tokens', userToken);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('POST /api/fcm/token/validate - Validate FCM token', async () => {
            const response = await makeRequest('post', '/api/fcm/token/validate', userToken, {
                token: testFCMToken
            });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('DELETE /api/fcm/token - Remove FCM token', async () => {
            const response = await makeRequest('delete', '/api/fcm/token', userToken, {
                token: testFCMToken
            });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ============================================================================
    // NOTIFICATION PREFERENCES TESTS
    // ============================================================================

    describe('Notification Preferences', () => {
        
        test('GET /api/fcm/preferences - Get user preferences', async () => {
            const response = await makeRequest('get', '/api/fcm/preferences', userToken);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('globalSettings');
            expect(response.body.data).toHaveProperty('categories');
        });

        test('PUT /api/fcm/preferences - Update preferences', async () => {
            const preferencesData = {
                globalSettings: {
                    enableNotifications: true,
                    enableSound: false,
                    quietHours: {
                        enabled: true,
                        startTime: '22:00',
                        endTime: '08:00'
                    }
                },
                categories: {
                    chat: {
                        enabled: true,
                        newMessage: true
                    }
                }
            };

            const response = await makeRequest('put', '/api/fcm/preferences', userToken, preferencesData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/preferences/chat - Get category preferences', async () => {
            const response = await makeRequest('get', '/api/fcm/preferences/chat', userToken);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('PUT /api/fcm/preferences/chat - Update category preferences', async () => {
            const categoryData = {
                enabled: false,
                newMessage: false
            };

            const response = await makeRequest('put', '/api/fcm/preferences/chat', userToken, categoryData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/preferences/global/toggle - Toggle global notifications', async () => {
            const response = await makeRequest('post', '/api/fcm/preferences/global/toggle', userToken);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('PUT /api/fcm/preferences/quiet-hours - Update quiet hours', async () => {
            const quietHoursData = {
                enabled: true,
                startTime: '23:00',
                endTime: '07:00'
            };

            const response = await makeRequest('put', '/api/fcm/preferences/quiet-hours', userToken, quietHoursData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/preferences/reset - Reset preferences', async () => {
            const response = await makeRequest('post', '/api/fcm/preferences/reset', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ============================================================================
    // NOTIFICATION HISTORY TESTS
    // ============================================================================

    describe('Notification History', () => {
        let testNotificationId;

        beforeAll(async () => {
            // Create a test notification history entry
            const testNotification = await NotificationHistory.create({
                userId: testUser._id,
                title: 'Test Notification',
                body: 'Test notification body',
                category: 'system',
                type: 'test',
                status: 'delivered',
                data: { test: true }
            });
            testNotificationId = testNotification._id;
        });

        test('GET /api/fcm/history - Get notification history', async () => {
            const response = await makeRequest('get', '/api/fcm/history', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('notifications');
            expect(response.body.data).toHaveProperty('pagination');
        });

        test('GET /api/fcm/history - Get history with filters', async () => {
            const response = await makeRequest('get', '/api/fcm/history?category=system&limit=10', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/history/:notificationId/opened - Mark as opened', async () => {
            const response = await makeRequest('post', `/api/fcm/history/${testNotificationId}/opened`, userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/history/:notificationId/clicked - Mark as clicked', async () => {
            const response = await makeRequest('post', `/api/fcm/history/${testNotificationId}/clicked`, userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/history/stats - Get notification stats', async () => {
            const response = await makeRequest('get', '/api/fcm/history/stats', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/history/unread-count - Get unread count', async () => {
            const response = await makeRequest('get', '/api/fcm/history/unread-count', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data.unreadCount).toBe('number');
        });

        test('POST /api/fcm/history/mark-all-read - Mark all as read', async () => {
            const response = await makeRequest('post', '/api/fcm/history/mark-all-read', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('DELETE /api/fcm/history/:notificationId - Delete notification', async () => {
            const response = await makeRequest('delete', `/api/fcm/history/${testNotificationId}`, userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ============================================================================
    // NOTIFICATION SCHEDULING TESTS
    // ============================================================================

    describe('Notification Scheduling', () => {
        let scheduledNotificationId;

        test('POST /api/fcm/schedule - Schedule notification', async () => {
            const scheduleData = {
                title: 'Scheduled Test Notification',
                body: 'This is a scheduled test notification',
                data: { type: 'test' },
                scheduledAt: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
                options: {
                    category: 'system',
                    type: 'test'
                }
            };

            const response = await makeRequest('post', '/api/fcm/schedule', userToken, scheduleData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            scheduledNotificationId = response.body.data._id;
        });

        test('GET /api/fcm/schedule - Get scheduled notifications', async () => {
            const response = await makeRequest('get', '/api/fcm/schedule', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('PUT /api/fcm/schedule/:notificationId - Update scheduled notification', async () => {
            const updateData = {
                title: 'Updated Scheduled Notification',
                body: 'Updated body text'
            };

            const response = await makeRequest('put', `/api/fcm/schedule/${scheduledNotificationId}`, userToken, updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/schedule/stats - Get scheduling stats', async () => {
            const response = await makeRequest('get', '/api/fcm/schedule/stats', userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('DELETE /api/fcm/schedule/:notificationId - Cancel scheduled notification', async () => {
            const response = await makeRequest('delete', `/api/fcm/schedule/${scheduledNotificationId}`, userToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ============================================================================
    // ADMIN ROUTES TESTS
    // ============================================================================

    describe('Admin Routes', () => {

        test('POST /api/fcm/admin/send-to-user - Send notification to specific user', async () => {
            const notificationData = {
                userId: testUser._id.toString(),
                title: 'Admin Test Notification',
                body: 'This is an admin test notification',
                data: { type: 'admin_test' }
            };

            const response = await makeRequest('post', '/api/fcm/admin/send-to-user', adminToken, notificationData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/admin/send-to-user - Fail with user token', async () => {
            const notificationData = {
                userId: testUser._id.toString(),
                title: 'Admin Test Notification',
                body: 'This should fail'
            };

            const response = await makeRequest('post', '/api/fcm/admin/send-to-user', userToken, notificationData);

            expect(response.status).toBe(403);
        });

        test('POST /api/fcm/admin/send-to-users - Send to multiple users', async () => {
            const notificationData = {
                userIds: [testUser._id.toString()],
                title: 'Bulk Admin Notification',
                body: 'This is a bulk notification',
                data: { type: 'bulk_admin' }
            };

            const response = await makeRequest('post', '/api/fcm/admin/send-to-users', adminToken, notificationData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/admin/broadcast - Send broadcast notification', async () => {
            const broadcastData = {
                title: 'System Broadcast',
                body: 'This is a system-wide broadcast',
                data: { type: 'broadcast' },
                options: {
                    category: 'system',
                    priority: 'high'
                }
            };

            const response = await makeRequest('post', '/api/fcm/admin/broadcast', adminToken, broadcastData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/admin/stats - Get notification statistics', async () => {
            const response = await makeRequest('get', '/api/fcm/admin/stats', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('overall');
        });

        test('GET /api/fcm/admin/failed - Get failed notifications', async () => {
            const response = await makeRequest('get', '/api/fcm/admin/failed', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/fcm/admin/poor-tokens - Get poor performing tokens', async () => {
            const response = await makeRequest('get', '/api/fcm/admin/poor-tokens', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/admin/cleanup - Cleanup old data', async () => {
            const cleanupData = {
                notificationDays: 30,
                tokenDays: 15
            };

            const response = await makeRequest('post', '/api/fcm/admin/cleanup', adminToken, cleanupData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/admin/process-scheduled - Process scheduled notifications', async () => {
            const response = await makeRequest('post', '/api/fcm/admin/process-scheduled', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/fcm/admin/cleanup-tokens - Cleanup old tokens', async () => {
            const response = await makeRequest('post', '/api/fcm/admin/cleanup-tokens', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ============================================================================
    // ERROR HANDLING TESTS
    // ============================================================================

    describe('Error Handling', () => {

        test('Invalid token format should fail', async () => {
            const invalidTokenData = {
                token: 'invalid_token',
                deviceInfo: { deviceId: 'test' }
            };

            const response = await makeRequest('post', '/api/fcm/token', userToken, invalidTokenData);

            expect(response.status).toBe(400);
        });

        test('Missing required fields should fail', async () => {
            const response = await makeRequest('post', '/api/fcm/token', userToken, {});

            expect(response.status).toBe(400);
        });

        test('Invalid category in preferences should fail', async () => {
            const response = await makeRequest('get', '/api/fcm/preferences/invalid_category', userToken);

            expect(response.status).toBe(400);
        });

        test('Non-existent notification ID should fail', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await makeRequest('post', `/api/fcm/history/${fakeId}/opened`, userToken);

            expect(response.status).toBe(404);
        });
    });

    // ============================================================================
    // RATE LIMITING TESTS
    // ============================================================================

    describe('Rate Limiting', () => {

        test('Should handle rate limiting gracefully', async () => {
            // Make multiple rapid requests to test rate limiting
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(makeRequest('get', '/api/fcm/tokens', userToken));
            }

            const responses = await Promise.all(promises);

            // All should succeed as we're within limits for testing
            responses.forEach(response => {
                expect([200, 429]).toContain(response.status);
            });
        });
    });
});

// ============================================================================
// MANUAL TEST RUNNER (if not using Jest)
// ============================================================================

if (require.main === module) {
    // Simple test runner for manual execution
    const runTests = async () => {
        console.log('🚀 Starting FCM Routes Functional Tests...\n');

        try {
            await connectDB();
            await setupTestData();

            console.log('✅ Test environment setup completed');
            console.log('📝 Run with a proper test framework like Jest for full test execution');
            console.log('   Example: npm install --save-dev jest supertest');
            console.log('   Then run: npx jest backend/tests/fcmRoutes.functional.test.js');

        } catch (error) {
            console.error('❌ Test setup failed:', error);
        } finally {
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
        }
    };

    runTests();
}

module.exports = {
    connectDB,
    setupTestData,
    makeRequest
};
