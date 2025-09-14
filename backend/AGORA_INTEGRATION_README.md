# Agora Integration Documentation

## Overview

This document describes the integration of Agora video/voice calling functionality into the Sevazon backend. The integration provides real-time communication capabilities while maintaining compatibility with the existing FCM notification system.

## Features Added

### 1. Agora Service Layer
- **Token Generation**: Generate Agora RTC tokens for secure channel access
- **Call Management**: Initiate, answer, decline, and end calls
- **Channel Management**: Automatic channel name generation for user pairs
- **Call State Tracking**: In-memory storage of active calls (can be extended to use Redis/database)

### 2. API Endpoints

#### Token Generation
- **POST** `/api/generate-call-token`
- Generate Agora token for a specific channel and user
- **Body**: `{ "channelName": "string", "userId": "string", "role": "publisher|subscriber" }`

#### Call Management
- **POST** `/api/initiate-call` - Start a call between two users
- **POST** `/api/answer-call/:callId` - Answer an incoming call
- **POST** `/api/decline-call/:callId` - Decline an incoming call
- **POST** `/api/end-call/:callId` - End an active call
- **GET** `/api/call/:callId` - Get call information
- **GET** `/api/call-history/:userId` - Get user's active calls
- **GET** `/api/agora/status` - Get Agora service health status

### 3. FCM Integration
- **Incoming Call Notifications**: Sent when a call is initiated
- **Call Status Notifications**: Sent when calls are answered, declined, or ended
- **High Priority**: Call notifications use high priority for immediate delivery
- **Platform Specific**: Custom sounds and channels for Android/iOS

### 4. Rate Limiting
- **General Agora Limit**: 200 requests per 15 minutes per IP
- **Token Generation**: 50 requests per minute
- **Call Operations**: 30 requests per minute

## Environment Configuration

### Required Environment Variables

Add the following variables to your `.env` file:

```env
# Agora Configuration
AGORA_APP_ID=400bb82ebad34539aebcb6de61e5a976
AGORA_APP_CERTIFICATE=9437621504594c9598384cddb7c508a0
AGORA_APP_CERTIFICATE_BACKUP=b466980f3c07476680496aca834b7a4c
```

### Certificate Configuration

The system supports **dual certificate configuration** for high availability:

- **Primary Certificate**: `9437621504594c9598384cddb7c508a0` (currently active)
- **Backup Certificate**: `b466980f3c07476680496aca834b7a4c` (automatic fallback)

### Certificate Fallback System

1. **Primary First**: Always attempts to use the primary certificate
2. **Automatic Fallback**: If primary fails, automatically switches to backup
3. **Persistent Switch**: Once switched to backup, continues using it until manual reset
4. **Error Handling**: Provides detailed error messages if both certificates fail

### Getting Agora Credentials

1. **Sign up** at [Agora.io](https://www.agora.io/)
2. **Create a project** in the Agora Console
3. **Get App ID**: Available immediately after project creation
4. **Get App Certificate**: Enable it in project settings (required for production)

### Development vs Production

- **Development**: App Certificate is optional (tokens will be null but functional for testing)
- **Production**: App Certificate is **REQUIRED** and **CONFIGURED** ✅
  - Primary certificate: Active and generating valid tokens
  - Backup certificate: Available for automatic failover
  - Token generation: Fully functional with secure authentication

## Installation

The integration has been completed with the following dependencies added:

```bash
npm install agora-token express-validator rate-limit-mongo compression express-mongo-sanitize xss-clean hpp helmet morgan
```

## Usage Examples

### 1. Generate Token
```bash
curl -X POST http://localhost:3000/api/generate-call-token \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "my_channel",
    "userId": "user123",
    "role": "publisher"
  }'
```

### 2. Initiate Call
```bash
curl -X POST http://localhost:3000/api/initiate-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "calleeId": "user456",
    "callType": "video"
  }'
```

### 3. Answer Call
```bash
curl -X POST http://localhost:3000/api/answer-call/call-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{}'
```

## Security Features

### 1. Authentication
- Most endpoints require authentication via JWT token
- User authorization checks for call operations

### 2. Rate Limiting
- Multiple layers of rate limiting to prevent abuse
- IP-based and user-based limits

### 3. Input Validation
- Comprehensive validation using express-validator
- UUID validation for call IDs
- Channel name format validation

### 4. Security Middleware
- XSS protection
- SQL injection prevention
- Parameter pollution prevention
- Helmet for security headers

## Integration Points

### 1. Existing FCM System
- Seamlessly integrated with existing notification preferences
- Uses existing FCM token management
- Respects user notification settings

### 2. Authentication System
- Uses existing JWT authentication middleware
- Compatible with existing user management

### 3. Rate Limiting System
- Extends existing rate limiting infrastructure
- Consistent with existing API patterns

## Call Flow

1. **Initiate**: Caller initiates call → FCM notification sent to callee
2. **Answer/Decline**: Callee responds → FCM notification sent to caller
3. **Active**: Both users join Agora channel with generated tokens
4. **End**: Either user ends call → FCM notification sent to other user

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/agora/status
```

Returns:
- Service status
- App ID (masked)
- Certificate configuration status
- Active calls count

## Troubleshooting

### Common Issues

1. **Token is null**: App Certificate not configured (acceptable for development)
2. **Call not found**: Call ID expired or invalid
3. **Unauthorized**: User not authenticated or not participant in call
4. **Rate limited**: Too many requests, wait and retry

### Logs
- All operations are logged with emoji prefixes for easy identification
- Error logs include detailed error messages
- Call state changes are tracked

## Future Enhancements

1. **Database Storage**: Replace in-memory call storage with database
2. **Call Recording**: Add recording capabilities
3. **Group Calls**: Support for multi-user calls
4. **Call Analytics**: Track call duration, quality metrics
5. **WebRTC Fallback**: Alternative for web clients

## Support

For issues related to:
- **Agora SDK**: Check [Agora Documentation](https://docs.agora.io/)
- **Integration**: Review this documentation and server logs
- **FCM**: Check existing FCM implementation documentation
