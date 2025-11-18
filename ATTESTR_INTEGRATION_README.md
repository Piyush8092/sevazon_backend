# Attestr PAN Verification Integration

This document describes the Attestr API integration for PAN (Permanent Account Number) verification in the Loklink/Sevazon application.

## Overview

The application now uses Attestr API for real-time PAN verification. This provides:
- Real PAN verification against government databases
- Enhanced security and fraud prevention
- Compliance with KYC regulations
- Automatic fallback to format validation if Attestr is unavailable

## Architecture

### Backend Components

1. **Configuration** (`backend/config/attestr.js`)
   - Manages Attestr API credentials
   - Provides endpoint URLs and authentication headers
   - Supports environment variable configuration

2. **Service** (`backend/services/attestrService.js`)
   - Handles all Attestr API communication
   - Implements PAN verification logic
   - Provides error handling and fallback mechanisms

3. **Controller** (`backend/controllers/newsEditor/kycVerification.js`)
   - Updated to use Attestr service for PAN verification
   - Maintains backward compatibility with Aadhaar format validation
   - Returns standardized verification responses

### Frontend Components (Flutter)

1. **Service** (`lib/services/kyc_service.dart`)
   - Provides KYC verification methods
   - Handles API communication with backend
   - Includes format validation utilities

2. **Controllers**
   - `account_controller.dart` - Updated to use KYC service
   - `personal_information_controller.dart` - Uses account controller for verification

3. **Endpoints** (`lib/core/network/endpoint.dart`)
   - Added KYC verification endpoints

## Environment Configuration

### Backend Environment Variables

Add the following variables to your `.env` file or environment configuration:

```bash
# Attestr API Configuration
ATTESTR_APP_NAME=OX0wC1E9VfeCmg-WEV
ATTESTR_APP_ID=5e24a57a567dc852589c0d1e7676332e
ATTESTR_APP_SECRET=c151b05c0c0ce49992afc08174d5525c5be9a4d89265bff1
ATTESTR_API_TOKEN=T1gwd0MxRTlWZmVDbWctV0VWLjVlMjRhNTdhNTY3ZGM4NTI1ODljMGQxZTc2NzYzMzJlOmMxNTFiMDVjMGMwY2U0OTk5MmFmYzA4MTc0ZDU1MjVjNWJlOWE0ZDg5MjY1YmZmMQ==

# Optional: Attestr API Configuration
ATTESTR_BASE_URL=https://api.attestr.com
ATTESTR_API_VERSION=v2
ATTESTR_TIMEOUT=30000
ATTESTR_ENABLED=true
```

### Security Best Practices

**IMPORTANT:** Never commit credentials to version control!

1. **For Development:**
   - Use `.env` file (already in `.gitignore`)
   - Keep credentials secure and don't share

2. **For Production:**
   - Use environment variables in your hosting platform
   - For Render.com: Add environment variables in the dashboard
   - For other platforms: Follow their environment variable configuration

3. **Credential Rotation:**
   - Regularly rotate API credentials
   - Update environment variables when credentials change
   - Monitor API usage for suspicious activity

## API Endpoints

### Backend Endpoints

#### Verify Document (PAN/Aadhaar)
```
POST /api/kyc/verify
```

**Request Body:**
```json
{
  "document_id": "ABCDE1234F",
  "document_type": "pan",
  "name": "John Doe",
  "dob": "01/01/1990"
}
```

**Response (Success):**
```json
{
  "message": "Document verified successfully",
  "status": 200,
  "success": true,
  "error": false,
  "data": {
    "verified": true,
    "verificationDetails": {
      "documentType": "pan",
      "documentId": "ABCDE1234F",
      "format": "valid",
      "lastFourDigits": "234F",
      "verified": true,
      "verificationProvider": "Attestr",
      "verificationId": "ATTESTR_1234567890",
      "name": "John Doe",
      "status": "VALID",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Failure):**
```json
{
  "message": "PAN verification failed",
  "status": 400,
  "success": false,
  "error": true,
  "details": {
    "error": "PAN_NOT_FOUND",
    "documentType": "pan",
    "documentId": "ABCDE1234F"
  }
}
```

### Document Types

- `pan` - PAN card only
- `aadhaar` - Aadhaar card only (format validation)
- `aadhaar_or_pan` - Auto-detect based on format

## Usage Examples

### Backend (Node.js)

```javascript
const attestrService = require('./services/attestrService');

// Verify PAN
const result = await attestrService.verifyPAN('ABCDE1234F', 'John Doe', '01/01/1990');

if (result.success && result.verified) {
  console.log('PAN verified:', result.data);
} else {
  console.error('Verification failed:', result.message);
}
```

### Frontend (Flutter)

```dart
import 'package:newproject/services/kyc_service.dart';

final kycService = KycService();

// Verify PAN
final response = await kycService.verifyPAN(
  panNumber: 'ABCDE1234F',
  name: 'John Doe',
  dob: '01/01/1990',
);

if (kycService.isVerificationSuccessful(response)) {
  print('PAN verified successfully');
  final verificationId = kycService.getVerificationId(response);
  print('Verification ID: $verificationId');
} else {
  print('Verification failed: ${kycService.getErrorMessage(response)}');
}
```

## Error Handling

### Error Codes

- `INVALID_FORMAT` - Document format is invalid
- `PAN_NOT_FOUND` - PAN not found in database
- `AUTH_ERROR` - Authentication failed with Attestr API
- `RATE_LIMIT` - Too many requests, rate limit exceeded
- `NETWORK_ERROR` - Network connectivity issue
- `UNKNOWN_ERROR` - Unexpected error occurred

### Fallback Mechanism

If Attestr API is unavailable or disabled:
1. System falls back to format validation
2. Response indicates "fallback verification"
3. User is notified that full verification requires API access

## Testing

### Test PAN Numbers

For testing purposes, you can use:
- Valid format: `ABCDE1234F`
- Invalid format: `ABC123` (will fail format validation)

**Note:** Real verification requires valid PAN numbers registered with Indian tax authorities.

### Testing Checklist

- [ ] Test valid PAN format
- [ ] Test invalid PAN format
- [ ] Test with name matching
- [ ] Test with DOB matching
- [ ] Test network error handling
- [ ] Test rate limiting
- [ ] Test fallback mechanism
- [ ] Test error messages display correctly

## Monitoring and Logging

### Backend Logs

The system logs:
- All API requests to Attestr
- Verification attempts (success/failure)
- Error conditions
- Fallback activations

### Log Levels

- `🔍` - Verification attempt
- `✅` - Successful verification
- `❌` - Failed verification
- `⚠️` - Warning (fallback mode, etc.)

## Deployment

### Render.com Deployment

1. Go to your Render.com dashboard
2. Select your backend service
3. Navigate to "Environment" tab
4. Add the Attestr environment variables
5. Save and redeploy

### Other Platforms

Follow your platform's documentation for setting environment variables.

## Support and Troubleshooting

### Common Issues

1. **"Authentication failed with Attestr API"**
   - Check if API token is correct
   - Verify token hasn't expired
   - Ensure token is properly set in environment variables

2. **"Rate limit exceeded"**
   - Wait before retrying
   - Consider implementing request queuing
   - Contact Attestr for higher rate limits

3. **"Network error"**
   - Check internet connectivity
   - Verify Attestr API is accessible
   - Check firewall settings

### Getting Help

- Check Attestr documentation: https://docs.attestr.com/
- Review application logs for detailed error messages
- Contact Attestr support for API-specific issues

## Future Enhancements

Potential improvements:
- [ ] Add Aadhaar verification via Attestr
- [ ] Implement verification caching
- [ ] Add webhook support for async verification
- [ ] Implement verification history tracking
- [ ] Add admin dashboard for verification monitoring

## License and Compliance

- Ensure compliance with data protection regulations
- Follow KYC/AML guidelines
- Maintain audit logs for verification attempts
- Implement data retention policies

---

**Last Updated:** 2024-01-08
**Version:** 1.0.0

