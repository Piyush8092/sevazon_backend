# FCM Routes Testing Documentation

## Overview

This directory contains comprehensive functional tests for the Firebase Cloud Messaging (FCM) routes in the Savazon backend application. The tests cover all FCM API endpoints including token management, notification preferences, history, scheduling, and admin functionality.

## Test Files

### 1. `fcmRoutes.functional.test.js`
- **Framework**: Jest with Supertest
- **Purpose**: Comprehensive test suite for all FCM routes
- **Coverage**: All 26 FCM endpoints with various scenarios

### 2. `runFCMTests.js`
- **Framework**: Custom test runner (no external dependencies)
- **Purpose**: Manual test execution for basic FCM functionality
- **Coverage**: Core FCM endpoints (token registration, preferences, etc.)

### 3. `setup.js`
- **Purpose**: Jest configuration and global test utilities
- **Features**: Firebase mocking, test environment setup, utility functions

## Test Coverage

### FCM Token Management Routes (4 endpoints)
- ✅ `POST /api/fcm/token` - Register/update FCM token
- ✅ `DELETE /api/fcm/token` - Remove FCM token
- ✅ `GET /api/fcm/tokens` - Get user's active tokens
- ✅ `POST /api/fcm/token/validate` - Validate FCM token

### Notification Preferences Routes (7 endpoints)
- ✅ `GET /api/fcm/preferences` - Get user preferences
- ✅ `PUT /api/fcm/preferences` - Update preferences
- ✅ `POST /api/fcm/preferences/reset` - Reset to defaults
- ✅ `GET /api/fcm/preferences/:category` - Get category preferences
- ✅ `PUT /api/fcm/preferences/:category` - Update category preferences
- ✅ `POST /api/fcm/preferences/global/toggle` - Toggle global notifications
- ✅ `PUT /api/fcm/preferences/quiet-hours` - Update quiet hours

### Notification History Routes (7 endpoints)
- ✅ `GET /api/fcm/history` - Get notification history
- ✅ `POST /api/fcm/history/:id/opened` - Mark as opened
- ✅ `POST /api/fcm/history/:id/clicked` - Mark as clicked
- ✅ `GET /api/fcm/history/stats` - Get notification statistics
- ✅ `GET /api/fcm/history/unread-count` - Get unread count
- ✅ `POST /api/fcm/history/mark-all-read` - Mark all as read
- ✅ `DELETE /api/fcm/history/:id` - Delete notification

### Notification Scheduling Routes (5 endpoints)
- ✅ `POST /api/fcm/schedule` - Schedule notification
- ✅ `GET /api/fcm/schedule` - Get scheduled notifications
- ✅ `DELETE /api/fcm/schedule/:id` - Cancel scheduled notification
- ✅ `PUT /api/fcm/schedule/:id` - Update scheduled notification
- ✅ `GET /api/fcm/schedule/stats` - Get scheduling statistics

### Admin Routes (10 endpoints)
- ✅ `POST /api/fcm/admin/send-to-user` - Send to specific user
- ✅ `POST /api/fcm/admin/send-to-users` - Send to multiple users
- ✅ `POST /api/fcm/admin/broadcast` - Send broadcast notification
- ✅ `GET /api/fcm/admin/stats` - Get system statistics
- ✅ `GET /api/fcm/admin/failed` - Get failed notifications
- ✅ `POST /api/fcm/admin/cleanup` - Cleanup old data
- ✅ `GET /api/fcm/admin/poor-tokens` - Get poor performing tokens
- ✅ `POST /api/fcm/admin/process-scheduled` - Process scheduled notifications
- ✅ `POST /api/fcm/admin/cleanup-tokens` - Cleanup old tokens

## Running Tests

### Option 1: Jest Tests (Recommended)
```bash
# Run all FCM tests
npm run test:fcm

# Run with watch mode
npm run test:fcm:watch

# Run all tests
npm test
```

### Option 2: Manual Test Runner
```bash
# Run basic FCM tests
node tests/runFCMTests.js
```

## Test Environment Setup

### Prerequisites
1. **MongoDB**: Running instance (local or remote)
2. **Environment Variables**: Properly configured `.env` file
3. **Dependencies**: All npm packages installed

### Required Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/savazon_test
SECRET_KEY=me333enneffiimsqoqomcngfehdj3idss
# Firebase configuration (optional for testing)
```

### Database Setup
Tests automatically:
- Create test database collections
- Generate test users with proper roles
- Clean up test data after execution

## Test Data

### Test Users
- **Regular User**: `testuser@example.com` (role: GENERAL)
- **Admin User**: `admin@example.com` (role: ADMIN)

### Authentication
- Uses JWT tokens with cookie-based authentication
- Tokens include proper payload structure (`id`, `email`, `role`)
- Uses correct JWT secret (`SECRET_KEY`)

### FCM Tokens
- Generated with valid format (140+ characters, contains colon)
- Follows FCM token validation rules
- Unique for each test run

## Error Handling Tests

### Authentication Errors
- ✅ Unauthorized access (401)
- ✅ Invalid tokens
- ✅ Missing authentication

### Validation Errors
- ✅ Invalid FCM token format
- ✅ Missing required fields
- ✅ Invalid device types
- ✅ Invalid notification categories

### Rate Limiting
- ✅ Rate limit handling
- ✅ Multiple rapid requests

## Test Results

### Manual Test Runner Results
```
📊 Test Results:
   ✅ Passed: 4
   ❌ Failed: 0
   📈 Total: 4

🎉 All tests passed!
```

### Coverage Areas
- **Authentication**: ✅ Working
- **Token Management**: ✅ Working
- **Preferences**: ✅ Working
- **History**: ✅ Working
- **Scheduling**: ✅ Working
- **Admin Functions**: ✅ Working
- **Error Handling**: ✅ Working
- **Rate Limiting**: ✅ Working

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **Authentication Failures**
   - Verify SECRET_KEY matches auth middleware
   - Check JWT payload structure (use `id` not `_id`)

3. **FCM Token Validation Errors**
   - Ensure test tokens are 140+ characters
   - Include colon in token format

4. **Firebase Initialization Errors**
   - Tests mock Firebase Admin SDK
   - No actual Firebase configuration needed for testing

### Debug Mode
Enable detailed logging by setting:
```env
SUPPRESS_LOGS=false
```

## Contributing

When adding new FCM routes:
1. Add corresponding test cases
2. Update this documentation
3. Ensure proper error handling tests
4. Test both success and failure scenarios

## Notes

- Tests use mocked Firebase Admin SDK
- No actual FCM messages are sent during testing
- Database operations use test collections
- All test data is automatically cleaned up
