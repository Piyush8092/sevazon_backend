# Simple Report and Block Functionality

## How to Use

### 1. Block a Service Profile
**URL:** `PUT /api/update-specific-service-report-block/:id`

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/update-specific-service-report-block/650666666666666666666666" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report": "Inappropriate content",
    "block": true
  }'
```

### 2. Get Blocked Profiles
**URL:** `GET /api/get-report-block-service-profile`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/get-report-block-service-profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response
```json
{
    "message": "Blocked service profiles retrieved successfully",
    "status": 200,
    "data": [
        {
            "_id": "profile_id",
            "profileType": "Service Profile",
            "yourName": "John Doe",
            "businessName": "John's Services",
            "userId": {
                "name": "John Doe",
                "email": "john@example.com"
            },
            "reportAndBlock": [
                {
                    "report": "Inappropriate content",
                    "block": true,
                    "reportAndBlockID": "your_user_id"
                }
            ]
        }
    ],
    "total": 1,
    "success": true,
    "error": false
}
```

## MongoDB Query
```javascript
// Find profiles blocked by logged-in user
const blockedProfiles = await createServiceModel.find({
    'reportAndBlock': {
        $elemMatch: {
            'reportAndBlockID': userId,
            'block': true
        }
    }
});
```
