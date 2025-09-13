# Firebase Cloud Messaging (FCM) Implementation Guide

## Overview

This implementation provides a complete Firebase Cloud Messaging (FCM) notification system for the Sevazon backend with the following features:

- FCM token management
- User notification preferences
- Event-driven notification triggers
- Notification history and audit trail
- Rate limiting and spam prevention
- Admin notification management
- Notification scheduling capabilities

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging API
4. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 2. Backend Configuration

1. **Environment Variables**: Add to your `.env` file:
```env
# Option 1: Service account file path
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Option 2: Service account as JSON string (recommended for production)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

2. **Service Account File**: 
   - Copy your Firebase service account JSON to `backend/config/firebase-service-account.json`
   - Or use the example file as template: `firebase-service-account.example.json`

### 3. Database Setup

The implementation automatically creates the following MongoDB collections:
- `fcmtokens` - Stores user device tokens
- `notificationpreferences` - User notification settings
- `notificationhistories` - Notification audit trail

## API Endpoints

### FCM Token Management

#### Register/Update FCM Token
```http
POST /api/fcm/token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm_device_token_here",
  "deviceInfo": {
    "deviceId": "unique_device_id",
    "deviceType": "android|ios|web",
    "deviceModel": "iPhone 13",
    "osVersion": "iOS 15.0",
    "appVersion": "1.0.0"
  }
}
```

#### Remove FCM Token
```http
DELETE /api/fcm/token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm_device_token_here"
  // OR
  "deviceId": "unique_device_id"
}
```

#### Get User's Active Tokens
```http
GET /api/fcm/tokens
Authorization: Bearer <jwt_token>
```

### Notification Preferences

#### Get User Preferences
```http
GET /api/fcm/preferences
Authorization: Bearer <jwt_token>
```

#### Update Preferences
```http
PUT /api/fcm/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "globalSettings": {
    "enableNotifications": true,
    "enableSound": true,
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    }
  },
  "categories": {
    "chat": {
      "enabled": true,
      "newMessage": true
    },
    "calls": {
      "enabled": true,
      "incomingCall": true
    }
  }
}
```

#### Toggle Global Notifications
```http
POST /api/fcm/preferences/global/toggle
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "enabled": false
}
```

### Notification History

#### Get Notification History
```http
GET /api/fcm/history?page=1&limit=20&category=chat&status=delivered
Authorization: Bearer <jwt_token>
```

#### Mark Notification as Opened
```http
POST /api/fcm/history/{notificationId}/opened
Authorization: Bearer <jwt_token>
```

#### Get Unread Count
```http
GET /api/fcm/history/unread-count
Authorization: Bearer <jwt_token>
```

#### Mark All as Read
```http
POST /api/fcm/history/mark-all-read
Authorization: Bearer <jwt_token>
```

### Notification Scheduling

#### Schedule Notification
```http
POST /api/fcm/schedule
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "title": "Scheduled Notification",
  "body": "This is a scheduled message",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "data": {
    "customKey": "customValue"
  },
  "options": {
    "category": "system",
    "priority": "normal"
  }
}
```

#### Get Scheduled Notifications
```http
GET /api/fcm/schedule?page=1&limit=20&status=pending
Authorization: Bearer <jwt_token>
```

#### Cancel Scheduled Notification
```http
DELETE /api/fcm/schedule/{notificationId}
Authorization: Bearer <jwt_token>
```

### Admin Endpoints (Admin Role Required)

#### Send Manual Notification
```http
POST /api/fcm/admin/send-to-user
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "target_user_id",
  "title": "Admin Message",
  "body": "Important announcement",
  "data": {
    "type": "admin_message"
  }
}
```

#### Broadcast Notification
```http
POST /api/fcm/admin/broadcast
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "System Announcement",
  "body": "Maintenance scheduled for tonight",
  "options": {
    "priority": "high"
  }
}
```

#### Get System Statistics
```http
GET /api/fcm/admin/stats?days=30
Authorization: Bearer <admin_jwt_token>
```

#### Get Failed Notifications
```http
GET /api/fcm/admin/failed?page=1&limit=50&days=7
Authorization: Bearer <admin_jwt_token>
```

## Event-Driven Notifications

### Using Notification Triggers

```javascript
const notificationTriggers = require('./services/notificationTriggers');

// New message notification
await notificationTriggers.onNewMessage({
  recipientId: 'user_id',
  senderId: 'sender_id',
  senderName: 'John Doe',
  messageText: 'Hello there!',
  chatType: 'private',
  messageId: 'msg_123',
  chatId: 'chat_456'
});

// Incoming call notification
await notificationTriggers.onIncomingCall({
  recipientId: 'user_id',
  callerId: 'caller_id',
  callerName: 'Jane Smith',
  callType: 'video',
  callId: 'call_789'
});

// Service offer notification
await notificationTriggers.onNewServiceOffer({
  recipientId: 'user_id',
  offerId: 'offer_123',
  offerTitle: 'Home Cleaning Service',
  offerCategory: 'Cleaning',
  providerId: 'provider_id',
  providerName: 'CleanCorp'
});

// Booking confirmation
await notificationTriggers.onBookingConfirmation({
  userId: 'user_id',
  bookingId: 'booking_123',
  serviceTitle: 'Plumbing Service',
  providerName: 'FixIt Pro',
  bookingDate: '2024-01-15',
  bookingTime: '10:00 AM'
});

// Payment notifications
await notificationTriggers.onPaymentReceived({
  userId: 'user_id',
  amount: 500,
  currency: 'INR',
  paymentId: 'pay_123',
  serviceTitle: 'Cleaning Service'
});
```

## Rate Limiting

The system includes comprehensive rate limiting:

- **General FCM endpoints**: 100 requests per 15 minutes per user
- **Token registration**: 10 requests per 5 minutes per user
- **Manual notifications**: 20 requests per minute per user
- **Preference updates**: 30 requests per 2 minutes per user
- **History queries**: 60 requests per minute per user

## Spam Prevention

- Content-based spam detection
- Duplicate notification prevention
- Rapid request detection
- Suspicious pattern filtering

## Notification Categories

The system supports the following notification categories:

- **chat**: Messages and group communications
- **calls**: Voice/video calls and missed calls
- **services**: Service offers and requests
- **bookings**: Booking confirmations and reminders
- **payments**: Payment confirmations and failures
- **jobs**: Job applications and updates
- **property**: Property inquiries and updates
- **news**: News posts and updates
- **system**: System announcements and admin messages

## Cron Jobs

Set up the following cron job to process scheduled notifications:

```bash
# Process scheduled notifications every minute
* * * * * curl -X POST http://localhost:3000/api/fcm/admin/process-scheduled \
  -H "Authorization: Bearer <admin_token>"

# Clean up old data daily at 2 AM
0 2 * * * curl -X POST http://localhost:3000/api/fcm/admin/cleanup \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"notificationDays": 90, "tokenDays": 30}'
```

## Error Handling

The system handles various FCM errors:

- Invalid tokens (automatically deactivated)
- Network failures (retry logic)
- Rate limiting (proper HTTP status codes)
- Authentication errors
- Malformed requests

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Admin endpoints require ADMIN role
3. **Rate Limiting**: Prevents abuse and spam
4. **Input Validation**: Comprehensive validation on all inputs
5. **Token Management**: Secure storage and automatic cleanup

## Monitoring and Analytics

- Delivery success/failure rates
- User engagement metrics (open/click rates)
- Category-wise notification statistics
- Token performance analysis
- Failed notification troubleshooting

## Testing

Use the provided endpoints to test the implementation:

1. Register FCM tokens for test devices
2. Set up notification preferences
3. Trigger test notifications
4. Monitor delivery and user interactions
5. Test admin functionality

## Troubleshooting

### Common Issues

1. **Firebase initialization fails**: Check service account configuration
2. **Tokens not receiving notifications**: Verify token validity and user preferences
3. **Rate limiting errors**: Implement proper retry logic in client
4. **High failure rates**: Check token cleanup and validation

### Debug Endpoints

- Check token validity: `POST /api/fcm/token/validate`
- View failed notifications: `GET /api/fcm/admin/failed`
- Monitor poor performing tokens: `GET /api/fcm/admin/poor-tokens`

## Production Deployment

1. Use environment variables for Firebase configuration
2. Set up proper logging and monitoring
3. Configure cron jobs for maintenance tasks
4. Implement proper backup strategies
5. Monitor notification delivery rates
6. Set up alerts for high failure rates
