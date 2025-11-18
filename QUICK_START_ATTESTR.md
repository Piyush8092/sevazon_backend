# Attestr PAN Verification - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add Environment Variables

Add these to your `.env` file or hosting platform:

```bash
ATTESTR_APP_NAME=OX0wC1E9VfeCmg-WEV
ATTESTR_APP_ID=5e24a57a567dc852589c0d1e7676332e
ATTESTR_APP_SECRET=c151b05c0c0ce49992afc08174d5525c5be9a4d89265bff1
ATTESTR_API_TOKEN=T1gwd0MxRTlWZmVDbWctV0VWLjVlMjRhNTdhNTY3ZGM4NTI1ODljMGQxZTc2NzYzMzJlOmMxNTFiMDVjMGMwY2U0OTk5MmFmYzA4MTc0ZDU1MjVjNWJlOWE0ZDg5MjY1YmZmMQ==
ATTESTR_ENABLED=true
```

### Step 2: Restart Backend Server

```bash
cd sevazon_backend/backend
npm start
```

### Step 3: Test the Integration

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "ABCDE1234F",
    "document_type": "pan"
  }'
```

**Expected Response:**
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
      "verified": true,
      "verificationProvider": "Attestr",
      "verificationId": "ATTESTR_1234567890"
    }
  }
}
```

### Step 4: Test in Flutter App

1. Run the Flutter app
2. Navigate to: **Account → Personal Information**
3. Enter a PAN number (format: AAAAA9999A)
4. Click "Verify"
5. See success/error message

---

## 📝 Usage Examples

### Backend (Node.js)

```javascript
const attestrService = require('./services/attestrService');

// Simple PAN verification
const result = await attestrService.verifyPAN('ABCDE1234F');

if (result.success && result.verified) {
  console.log('✅ PAN verified!');
  console.log('Verification ID:', result.data.verificationId);
} else {
  console.log('❌ Verification failed:', result.message);
}

// PAN verification with name matching
const result = await attestrService.verifyPAN(
  'ABCDE1234F',
  'John Doe',
  '01/01/1990'
);
```

### Frontend (Flutter)

```dart
import 'package:newproject/services/kyc_service.dart';

final kycService = KycService();

// Verify PAN
final response = await kycService.verifyPAN(
  panNumber: 'ABCDE1234F',
);

if (kycService.isVerificationSuccessful(response)) {
  print('✅ Verified!');
} else {
  print('❌ Failed: ${kycService.getErrorMessage(response)}');
}
```

---

## 🔍 Testing

### Valid Test Cases

**Valid PAN Format:**
- `ABCDE1234F`
- `AAAAA9999A`
- `BBBBB1111B`

**Valid Aadhaar Format:**
- `123456789012`
- `999988887777`

### Invalid Test Cases

**Invalid PAN:**
- `ABC123` (too short)
- `ABCDE12345` (wrong format)
- `12345ABCDE` (wrong format)

**Invalid Aadhaar:**
- `12345` (too short)
- `1234567890123` (too long)

---

## 🐛 Troubleshooting

### Issue: "Authentication failed"

**Solution:**
```bash
# Check if env variables are set
echo $ATTESTR_API_TOKEN

# Restart server after adding env variables
npm restart
```

### Issue: "Network error"

**Solution:**
- Check internet connection
- Verify Attestr API is accessible: `curl https://api.attestr.com`
- Check firewall settings

### Issue: "Rate limit exceeded"

**Solution:**
- Wait 1 minute before retrying
- Reduce verification frequency
- Contact Attestr for higher limits

---

## 📊 Monitoring

### Check Logs

**Backend logs show:**
```
🔍 Attestr API Request: POST /api/v2/public/pan/verify
✅ Attestr API Response: 200 /api/v2/public/pan/verify
🔍 Verifying PAN: ABCDE1234F
```

**Error logs show:**
```
❌ Attestr API Response Error: 401 Unauthorized
❌ Error verifying PAN with Attestr: Authentication failed
```

### Success Indicators

✅ Backend logs show: "✅ Attestr configuration loaded successfully"  
✅ API returns 200 status  
✅ Response includes `verified: true`  
✅ Frontend shows success message

---

## 🔒 Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] `.env` file is in `.gitignore`
- [ ] API token is kept secret
- [ ] HTTPS is used in production
- [ ] Rate limiting is configured
- [ ] Logs don't expose sensitive data

---

## 📚 API Reference

### Endpoint: `/api/kyc/verify`

**Method:** POST

**Request Body:**
```json
{
  "document_id": "ABCDE1234F",
  "document_type": "pan",
  "name": "John Doe",
  "dob": "01/01/1990"
}
```

**Document Types:**
- `pan` - PAN card only
- `aadhaar` - Aadhaar card only
- `aadhaar_or_pan` - Auto-detect

**Success Response (200):**
```json
{
  "success": true,
  "message": "Document verified successfully",
  "data": {
    "verified": true,
    "verificationDetails": {
      "documentType": "pan",
      "documentId": "ABCDE1234F",
      "verificationId": "ATTESTR_1234567890",
      "name": "John Doe",
      "status": "VALID"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "PAN verification failed",
  "error": true,
  "details": {
    "error": "PAN_NOT_FOUND"
  }
}
```

**Error Codes:**
- `INVALID_FORMAT` - Invalid document format
- `PAN_NOT_FOUND` - PAN not found in database
- `AUTH_ERROR` - Authentication failed
- `RATE_LIMIT` - Too many requests
- `NETWORK_ERROR` - Network connectivity issue

---

## 🎯 Common Use Cases

### Use Case 1: Verify PAN in User Profile

```dart
// In personal_information_controller.dart
final result = await verifyDocument();

if (result) {
  // Update user profile
  // Show success message
} else {
  // Show error message
}
```

### Use Case 2: Verify PAN in News Profile Application

```dart
// In apply_news_profile_screen.dart
final response = await _kycService.verifyPAN(
  panNumber: _aadhaarController.text,
);

if (_kycService.isVerificationSuccessful(response)) {
  setState(() => isKycVerified = true);
}
```

### Use Case 3: Backend Verification

```javascript
// In kycVerification.js controller
const result = await attestrService.verifyPAN(
  normalizedId,
  name,
  dob
);

if (result.success && result.verified) {
  // Store verification details
  // Return success response
}
```

---

## 📞 Support

**Documentation:**
- Full Guide: `ATTESTR_INTEGRATION_README.md`
- Summary: `ATTESTR_INTEGRATION_SUMMARY.md`
- This Guide: `QUICK_START_ATTESTR.md`

**Attestr Support:**
- Documentation: https://docs.attestr.com/
- Support: support@attestr.com

**Application Logs:**
- Backend: Check console output
- Frontend: Check Flutter debug console

---

## ✅ Deployment Checklist

### Before Deploying

- [ ] Environment variables are set
- [ ] Tested with valid PAN numbers
- [ ] Tested with invalid PAN numbers
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] Success/error messages are clear

### After Deploying

- [ ] Verify environment variables in production
- [ ] Test verification flow in production
- [ ] Monitor logs for errors
- [ ] Check API response times
- [ ] Verify rate limiting works

---

**Last Updated:** 2024-01-08  
**Version:** 1.0.0

