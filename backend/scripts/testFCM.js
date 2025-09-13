// Test script for FCM implementation
// Run with: node scripts/testFCM.js

require('dotenv').config();
const mongoose = require('mongoose');

// Import models and services
const FCMToken = require('../model/fcmTokenModel');
const NotificationPreferences = require('../model/notificationPreferencesModel');
const NotificationHistory = require('../model/notificationHistoryModel');
const User = require('../model/userModel');
const notificationService = require('../services/notificationService');
const notificationTriggers = require('../services/notificationTriggers');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sevazon_test');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Test functions
const testFCMTokenModel = async () => {
    console.log('\n🧪 Testing FCM Token Model...');
    
    try {
        // Create a test user first
        const testUser = await User.findOne({ email: 'test@example.com' }) || 
                         await User.create({
                             name: 'Test User',
                             email: 'test@example.com',
                             password: 'password123'
                         });

        // Test token creation
        const tokenData = {
            userId: testUser._id,
            token: 'test_fcm_token_' + Date.now(),
            deviceInfo: {
                deviceId: 'test_device_123',
                deviceType: 'android',
                deviceModel: 'Test Device',
                osVersion: 'Android 12',
                appVersion: '1.0.0'
            }
        };

        const fcmToken = new FCMToken(tokenData);
        await fcmToken.save();
        console.log('✅ FCM Token created successfully');

        // Test finding active tokens
        const activeTokens = await FCMToken.findActiveTokensForUser(testUser._id);
        console.log(`✅ Found ${activeTokens.length} active tokens for user`);

        // Test token deactivation
        await fcmToken.deactivate();
        console.log('✅ Token deactivated successfully');

        // Test delivery stats update
        await fcmToken.updateDeliveryStats(true);
        console.log('✅ Delivery stats updated successfully');

    } catch (error) {
        console.error('❌ FCM Token Model test failed:', error.message);
    }
};

const testNotificationPreferences = async () => {
    console.log('\n🧪 Testing Notification Preferences...');
    
    try {
        const testUser = await User.findOne({ email: 'test@example.com' });
        
        // Test creating default preferences
        const preferences = await NotificationPreferences.findOrCreateForUser(testUser._id);
        console.log('✅ Default preferences created');

        // Test preference checking
        const shouldSend = preferences.shouldSendNotification('chat', 'newMessage');
        console.log(`✅ Should send chat notification: ${shouldSend}`);

        // Test updating preferences
        preferences.categories.chat.enabled = false;
        await preferences.save();
        console.log('✅ Preferences updated successfully');

        const shouldSendAfterUpdate = preferences.shouldSendNotification('chat', 'newMessage');
        console.log(`✅ Should send chat notification after update: ${shouldSendAfterUpdate}`);

    } catch (error) {
        console.error('❌ Notification Preferences test failed:', error.message);
    }
};

const testNotificationHistory = async () => {
    console.log('\n🧪 Testing Notification History...');
    
    try {
        const testUser = await User.findOne({ email: 'test@example.com' });
        
        // Create test notification history
        const historyData = {
            userId: testUser._id,
            title: 'Test Notification',
            body: 'This is a test notification',
            category: 'system',
            type: 'test',
            status: 'sent'
        };

        const history = new NotificationHistory(historyData);
        await history.save();
        console.log('✅ Notification history created');

        // Test marking as delivered
        await history.markAsDelivered();
        console.log('✅ Notification marked as delivered');

        // Test tracking interaction
        await history.trackInteraction('opened');
        console.log('✅ User interaction tracked');

        // Test getting delivery stats
        const stats = await NotificationHistory.getDeliveryStats({
            userId: testUser._id
        });
        console.log('✅ Delivery stats retrieved:', stats[0] || 'No stats');

    } catch (error) {
        console.error('❌ Notification History test failed:', error.message);
    }
};

const testNotificationService = async () => {
    console.log('\n🧪 Testing Notification Service...');
    
    try {
        const testUser = await User.findOne({ email: 'test@example.com' });
        
        // Test creating notification payload
        const payload = notificationService.createNotificationPayload(
            'Test Title',
            'Test Body',
            { customData: 'test' },
            { priority: 'high' }
        );
        console.log('✅ Notification payload created');

        // Test scheduling notification
        const scheduledAt = new Date(Date.now() + 60000); // 1 minute from now
        const scheduleResult = await notificationService.scheduleNotification(
            testUser._id,
            'Scheduled Test',
            'This is a scheduled test notification',
            { type: 'test' },
            scheduledAt,
            { category: 'system', type: 'test' }
        );
        console.log('✅ Notification scheduled:', scheduleResult);

    } catch (error) {
        console.error('❌ Notification Service test failed:', error.message);
    }
};

const testNotificationTriggers = async () => {
    console.log('\n🧪 Testing Notification Triggers...');
    
    try {
        const testUser = await User.findOne({ email: 'test@example.com' });
        
        // Test system announcement trigger
        const result = await notificationTriggers.onSystemAnnouncement({
            title: 'Test Announcement',
            message: 'This is a test system announcement',
            targetUsers: [testUser._id],
            priority: 'normal'
        });
        console.log('✅ System announcement trigger tested:', result.success ? 'Success' : 'Failed');

        // Test service request trigger (will fail without actual tokens, but tests the logic)
        const serviceResult = await notificationTriggers.onServiceRequest({
            providerId: testUser._id,
            requesterId: testUser._id,
            requesterName: 'Test Requester',
            serviceTitle: 'Test Service',
            requestMessage: 'Test request message',
            serviceId: testUser._id
        });
        console.log('✅ Service request trigger tested:', serviceResult.success ? 'Success' : 'Failed');

    } catch (error) {
        console.error('❌ Notification Triggers test failed:', error.message);
    }
};

const testCleanupFunctions = async () => {
    console.log('\n🧪 Testing Cleanup Functions...');
    
    try {
        // Test token cleanup
        const tokenCleanup = await FCMToken.cleanupOldTokens(0); // Clean all inactive tokens
        console.log(`✅ Token cleanup: ${tokenCleanup.deletedCount} tokens deleted`);

        // Test notification cleanup
        const notificationCleanup = await NotificationHistory.cleanupOldNotifications(0); // Clean all old notifications
        console.log(`✅ Notification cleanup: ${notificationCleanup.deletedCount} notifications deleted`);

    } catch (error) {
        console.error('❌ Cleanup functions test failed:', error.message);
    }
};

const runAllTests = async () => {
    console.log('🚀 Starting FCM Implementation Tests...\n');
    
    await connectDB();
    
    await testFCMTokenModel();
    await testNotificationPreferences();
    await testNotificationHistory();
    await testNotificationService();
    await testNotificationTriggers();
    await testCleanupFunctions();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Note: Some tests may show "Failed" results if Firebase is not properly configured.');
    console.log('   This is expected in a test environment without actual FCM tokens.');
    
    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
    process.exit(1);
});

// Run tests
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testFCMTokenModel,
    testNotificationPreferences,
    testNotificationHistory,
    testNotificationService,
    testNotificationTriggers,
    testCleanupFunctions
};
