const createServiceModel = require('../../model/createAllServiceProfileModel');

 
const FilterServices = async (req, res) => {
    try {
        // Extract query parameters
        const {
            // Basic Info Filters
            name,           // yourName or businessName
            profileType,    // 'Service Profile' or 'Business Profile'
            serviceType,    // 'premium' or 'featured'
            gender,         // 'Male', 'Female', 'Other'
            
            // Location Filters
            city,
            state,
            pincode,
            area,
            
            // Category Filters
            category,       // selectCategory
            subCategory,    // selectSubCategory
            subCategoryOther,
            
            // Business/Service Filters
            experience,
            establishedYear,
            
            // Price Range Filters
            minPrice,
            maxPrice,
            
            // Search Query (for text search)
            search,
            
            // Pagination
            page = 1,
            limit = 10,
            
            // Sorting
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build dynamic filter object
        const filter = {};
        
        // Only add filters if parameters are provided
        if (profileType) {
            filter.profileType = profileType;
        }
        
        if (serviceType) {
            filter.serviceType = serviceType;
        }
        
        if (gender) {
            filter.gender = gender;
        }
        
        if (city) {
            filter.city = new RegExp(city, 'i'); // Case-insensitive search
        }
        
        if (state) {
            filter.state = new RegExp(state, 'i');
        }
        
        if (pincode) {
            filter.pincode = pincode;
        }
        
        if (area) {
            filter.area = new RegExp(area, 'i');
        }
        
        if (category) {
            filter.selectCategory = new RegExp(category, 'i');
        }
        
        if (subCategory) {
            filter.selectSubCategory = new RegExp(subCategory, 'i');
        }
        
        if (experience) {
            filter.experience = new RegExp(experience, 'i');
        }
        
        if (establishedYear) {
            filter.establishedInYear = establishedYear;
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        // Name search (searches in both yourName and businessName)
        if (name) {
            filter.$or = [
                { yourName: new RegExp(name, 'i') },
                { businessName: new RegExp(name, 'i') }
            ];
        }
        
        // General text search across multiple fields
        if (search) {
            filter.$or = [
                { yourName: new RegExp(search, 'i') },
                { businessName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { businessSummary: new RegExp(search, 'i') },
                { selectCategory: new RegExp(search, 'i') },
                { selectSubCategory: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') },
                { state: new RegExp(search, 'i') },
                { area: new RegExp(search, 'i') }
            ];
        }
        
        // Always filter for active profiles
        filter.isActive = true;
        
        // Pagination setup
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Sorting setup
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Execute query with filters, pagination, and sorting
        const result = await createServiceModel
            .find(filter)
            .populate('userId', 'name email phone profileImage')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
        
        // Get total count for pagination
        const total = await createServiceModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);
        
        // Response
        res.json({
            message: 'Services filtered successfully',
            status: 200,
            data: result,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            filters: {
                applied: Object.keys(req.query).filter(key => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)),
                total: Object.keys(filter).length
            },
            success: true,
            error: false
        });
        
    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { FilterServices };
