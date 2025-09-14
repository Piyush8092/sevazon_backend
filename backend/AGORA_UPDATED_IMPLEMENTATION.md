# Agora Service - Updated Implementation

## Overview

The Agora service has been updated with improved development mode support, better error handling, and enhanced configuration management. This implementation provides seamless development experience while maintaining production security.

## Key Features

### 1. Development Mode Support
- **Automatic Fallback**: When certificates are not configured in development, the service automatically provides null tokens
- **Development Placeholder**: Uses a placeholder certificate to prevent crashes during development
- **Clear Warnings**: Provides clear console warnings when running in development mode without proper certificates

### 2. Enhanced Error Handling
- **Graceful Degradation**: Falls back to null tokens in development when certificate errors occur
- **Detailed Error Messages**: Provides specific error information for debugging
- **Multiple Certificate Support**: Maintains backup certificate functionality

### 3. Improved Status Reporting
- **Environment Detection**: Clearly indicates development vs production mode
- **Certificate Status**: Shows detailed certificate configuration status
- **Token Generation Status**: Indicates whether null tokens will be generated

## Configuration

### Environment Variables

```env
# Required
AGORA_APP_ID=400bb82ebad34539aebcb6de61e5a976

# Production Required (Optional for Development)
AGORA_APP_CERTIFICATE=your-agora-app-certificate-here

# Optional Backup Certificate
AGORA_APP_CERTIFICATE_BACKUP=your-backup-certificate-here

# Environment
NODE_ENV=development  # or production
```

### Development Mode Behavior

When `NODE_ENV=development` and no certificate is configured:
1. Service initializes with a development placeholder certificate
2. Token generation returns null tokens with development mode flags
3. Console warnings indicate development mode usage
4. API responses include `developmentMode: true` flag

### Production Mode Behavior

When certificates are properly configured:
1. Service generates real Agora tokens
2. Backup certificate fallback is available
3. Full error handling with no null token fallbacks
4. API responses include `developmentMode: false` flag

## API Responses

### Token Generation Response (Development Mode)

```json
{
  "success": true,
  "message": "Token generated successfully",
  "data": {
    "token": null,
    "channelName": "test_channel_123",
    "userId": "user_123",
    "uid": 123456,
    "expiresAt": 1234567890000,
    "appId": "400bb82ebad34539aebcb6de61e5a976",
    "certificateStatus": "not_configured",
    "developmentMode": true
  }
}
```

### Token Generation Response (Production Mode)

```json
{
  "success": true,
  "message": "Token generated successfully",
  "data": {
    "token": "006400bb82ebad34539aebcb6de61e5a976IAD...",
    "channelName": "test_channel_123",
    "userId": "user_123",
    "uid": 123456,
    "expiresAt": 1734567890000,
    "appId": "400bb82ebad34539aebcb6de61e5a976",
    "certificateUsed": "primary",
    "certificateStatus": "configured",
    "developmentMode": false
  }
}
```

### Service Status Response

```json
{
  "success": true,
  "message": "Agora service status retrieved successfully",
  "data": {
    "status": "healthy",
    "appId": "400bb82ebad34539aebcb6de61e5a976",
    "environment": "development",
    "developmentMode": true,
    "certificates": {
      "primary": {
        "configured": true,
        "value": "94376215...",
        "isPlaceholder": false
      },
      "backup": {
        "configured": true,
        "value": "b466980f..."
      },
      "currentlyUsing": "primary",
      "usingPlaceholder": false
    },
    "tokenGeneration": {
      "willGenerateNullTokens": false,
      "reason": "Certificates properly configured"
    },
    "activeCalls": 0,
    "timestamp": "2025-09-14T00:49:27.472Z"
  }
}
```

## Testing

### Run Tests

```bash
# Test normal functionality
node scripts/testAgoraService.js

# Test development mode
node scripts/testAgoraDevMode.js
```

### API Testing

```bash
# Test token generation
curl -X POST http://localhost:3000/api/generate-call-token \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "test_channel_123",
    "userId": "user_123",
    "role": "publisher"
  }'

# Test service status
curl http://localhost:3000/api/agora/status
```

## Production Setup

### 1. Get Agora Credentials
1. Log into [Agora Console](https://console.agora.io/)
2. Go to Project Management
3. Select your project
4. Copy App ID and App Certificate

### 2. Update Environment Variables
```env
AGORA_APP_ID=your-app-id
AGORA_APP_CERTIFICATE=your-app-certificate
NODE_ENV=production
```

### 3. Verify Configuration
- Check service status endpoint
- Verify `developmentMode: false` in responses
- Confirm real tokens are being generated

## Migration Notes

### From Previous Version
- All existing API endpoints remain unchanged
- Existing functionality is preserved
- New fields added to responses are optional for clients
- Backward compatibility maintained

### Client Integration
- Clients should check `developmentMode` flag in responses
- Handle null tokens gracefully in development
- Use real tokens in production as before

## Security Considerations

- Development placeholder certificate is clearly marked and logged
- Production requires real certificates
- Null tokens are only provided in development mode
- Certificate values are masked in status responses

## Troubleshooting

### Common Issues

1. **Null tokens in production**: Check certificate configuration
2. **Development warnings**: Normal in development without certificates
3. **Certificate errors**: Check backup certificate configuration

### Debug Information

Check service status endpoint for:
- Certificate configuration status
- Current environment mode
- Token generation behavior
- Active calls count

## Support

For issues or questions:
1. Check service status endpoint
2. Review console logs for warnings
3. Verify environment variable configuration
4. Test with provided scripts
