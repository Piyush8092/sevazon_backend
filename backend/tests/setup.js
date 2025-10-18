/**
 * Jest setup file for FCM tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/savazon_test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock Firebase Admin SDK for testing
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn()
    },
    messaging: jest.fn(() => ({
        send: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
        sendMulticast: jest.fn().mockResolvedValue({
            successCount: 1,
            failureCount: 0,
            responses: [{ success: true, messageId: 'test-message-id' }]
        })
    }))
}));

// Global test utilities
global.testUtils = {
    generateTestToken: () => 'test_fcm_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    generateTestDeviceId: () => 'test_device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
};

// Suppress console logs during testing unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    if (process.env.SUPPRESS_LOGS !== 'false') {
        console.log = jest.fn();
        console.error = jest.fn();
    }
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});
