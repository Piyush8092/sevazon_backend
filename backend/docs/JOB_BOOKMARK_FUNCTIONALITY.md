# Job Bookmark Functionality (Service Profile Pattern)

## Overview
Job favorite functionality now follows the same pattern as service profiles - using the user's bookmark array and populate method.

## API Endpoints

### 1. Favorite/Unfavorite a Job
**URL:** `PUT /api/update-job-favourite/:id`

**Request Body:**
```json
{
    "isFavorite": true  // or false to unfavorite
}
```

**What Happens:**
1. Adds/removes user to job's `favoriteJob` array
2. Adds/removes job ID to user's `jobProfileBookmarkID` array

### 2. Get User's Favorite Jobs (New - Service Profile Pattern)
**URL:** `GET /api/get-user-favourite-job`

**What It Does:**
- Finds the authenticated user
- Populates the `jobProfileBookmarkID` array with full job details
- Returns only active jobs

### 3. Get Bookmarked Jobs (Alternative Endpoint)
**URL:** `GET /api/get-bookmark-job-post`

**Same functionality as above but different endpoint name**

## Example Usage

```bash
# Favorite a job
curl -X PUT "http://localhost:3000/api/update-job-favourite/650666666666666666666666" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isFavorite": true}'

# Get user's favorite jobs (NEW - follows service profile pattern)
curl -X GET "http://localhost:3000/api/get-user-favourite-job" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Alternative endpoint for bookmarked jobs
curl -X GET "http://localhost:3000/api/get-bookmark-job-post" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

### Get Favorite Jobs Response:
```json
{
    "message": "User favorite jobs fetched successfully",
    "status": 200,
    "success": true,
    "error": false,
    "total": 2,
    "data": [
        {
            "_id": "job_id_1",
            "title": "Software Developer",
            "yourNameBusinessInstituteFirmCompany": "Tech Corp",
            "selectCategory": "IT",
            "selectSubCategory": "Software Development",
            "address": "Bangalore",
            "pincode": "560001",
            "description": "Job description...",
            "salaryFrom": "50000",
            "salaryTo": "80000",
            "salaryPer": "Month",
            "requiredExperience": "2-3 years",
            "workMode": ["Remote"],
            "workShift": ["Day"],
            "workType": ["Full-time"],
            "allowCallInApp": true,
            "allowChat": true,
            "isActive": true,
            "isVerified": false,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

## Key Changes from Previous Implementation

### Before (Complex Aggregation):
- Used MongoDB aggregation pipeline
- Complex `$match` and `$project` operations
- Pagination logic
- More database operations

### Now (Service Profile Pattern):
- Simple `findById` with `populate`
- Cleaner code structure
- Follows established pattern
- Easier to maintain

## Database Structure

### User Model:
```javascript
jobProfileBookmarkID: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfileModel'  // References job model
}]
```

### Job Model:
```javascript
favoriteJob: [{
    userId: ObjectId,
    jobId: ObjectId,
    isFavorite: Boolean
}]
```

## Benefits
- **Consistency:** Same pattern as service profiles and matrimony
- **Simplicity:** Cleaner, more maintainable code
- **Performance:** Direct populate is often faster than aggregation
- **Reliability:** Follows proven pattern used elsewhere in the app
