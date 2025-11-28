# Backend Updates Required for Hierarchical Location Filtering

## Current Implementation

The current backend implementation for news filtering only supports **state-level** location filtering:

### NewsPost Model (`backend/model/NewsPost.js`)
- Currently has only one location field: `location` (String) - stores the state name
- This field is required when creating news posts

### Query News Controller (`backend/controllers/NewsPost/queryNews.js`)
- Accepts `location` query parameter
- Filters news by exact match on the `location` field (state name)

## Required Updates for Full Hierarchical Support

To support the new hierarchical location filtering (State → District → Block), the following backend changes are needed:

### 1. Update NewsPost Model

Add district and block fields to the schema:

```javascript
// backend/model/NewsPost.js

let NewsSchame = new mongoose.Schema({
    // ... existing fields ...
    
    // Location fields - hierarchical
    state: {
        type: String,
        required: [true, 'State is required'],
    },
    district: {
        type: String,
        // Optional - not all news needs to be district-specific
    },
    block: {
        type: String,
        // Optional - not all news needs to be block-specific
    },
    
    // Keep old 'location' field for backward compatibility
    location: {
        type: String,
        required: [true, 'Location/State is required'],
    }
    
    // ... rest of fields ...
}, {timestamps: true});
```

### 2. Update Query News Controller

Modify the query logic to support hierarchical filtering:

```javascript
// backend/controllers/NewsPost/queryNews.js

const queryNews = async (req, res) => {
    try {
        let query = req.query.query;
        let state = req.query.state;       // New parameter
        let district = req.query.district; // New parameter
        let block = req.query.block;       // New parameter
        let location = req.query.location; // Keep for backward compatibility
        let category = req.query.category;

        // ... pagination setup ...

        // Build search query
        let searchQuery = {};

        // ... existing query logic ...

        // Hierarchical location filtering
        if (state) {
            searchQuery.state = state;
        }
        if (district) {
            searchQuery.district = district;
        }
        if (block) {
            searchQuery.block = block;
        }
        
        // Backward compatibility: if 'location' is provided, use it for state
        if (location && !state) {
            searchQuery.location = location;
        }

        // ... rest of the query logic ...
    }
    // ... error handling ...
};
```

### 3. Update Create News Controller

Update the news creation to accept and validate hierarchical location data:

```javascript
// backend/controllers/NewsPost/createNews.js

const createNews = async (req, res) => {
    try {
        let payload = req.body;

        // Validate required fields
        if (!payload.state) {
            return res.status(400).json({
                message: 'State is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Set location field for backward compatibility
        payload.location = payload.state;

        // ... rest of creation logic ...
    }
    // ... error handling ...
};
```

### 4. Update Get All News Controller

Add support for hierarchical filtering in getAllNews:

```javascript
// backend/controllers/NewsPost/getAllNews.js

const getAllNews = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let state = req.query.state;
        let district = req.query.district;
        let block = req.query.block;
        let location = req.query.location; // Backward compatibility
        
        const skip = (page - 1) * limit;

        // Build query filter
        let queryFilter = {userId: {$nin: [req.user._id]}};

        // Add hierarchical location filters
        if (state) queryFilter.state = state;
        if (district) queryFilter.district = district;
        if (block) queryFilter.block = block;
        
        // Backward compatibility
        if (location && !state) queryFilter.location = location;

        // ... rest of query logic ...
    }
    // ... error handling ...
};
```

## Migration Strategy

1. **Phase 1**: Add new fields to the model while keeping the old `location` field
2. **Phase 2**: Update all controllers to support both old and new fields
3. **Phase 3**: Migrate existing data (copy `location` to `state` field)
4. **Phase 4**: Update frontend to use new hierarchical filtering
5. **Phase 5** (Optional): Deprecate the old `location` field after ensuring all clients are updated

## Current Frontend Implementation

The frontend has been updated to support hierarchical location filtering:
- State → District → Block selection UI
- Location data structure with Indian states, districts, and blocks
- Controller methods for hierarchical navigation
- Currently filters by state only (due to backend limitation)

## Notes

- The current implementation filters by **state only** because the backend doesn't support district and block filtering yet
- The UI is fully functional and ready to support district and block filtering once backend is updated
- The location data in `sevazon/lib/data/location_data.dart` contains sample districts and blocks for major Indian states
- For production, consider fetching location data from a dedicated API or database

