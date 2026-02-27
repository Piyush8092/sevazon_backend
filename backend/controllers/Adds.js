 const adModel = require('../model/adModel');
 const userModel = require('../model/userModel');

/**
 * Helper function to calculate distance between two pincodes
 * Uses numerical difference as a simple approximation
 * @param {string} pincode1 - First pincode
 * @param {string} pincode2 - Second pincode
 * @returns {number} - Distance (numerical difference)
 */
const calculatePincodeDistance = (pincode1, pincode2) => {
    if (!pincode1 || !pincode2) return Infinity;
    const num1 = parseInt(pincode1);
    const num2 = parseInt(pincode2);
    if (isNaN(num1) || isNaN(num2)) return Infinity;
    return Math.abs(num1 - num2);
};

// create ads
const CreateAdd = async (req, res) => {
    try {
        let payload = req.body;


        // Validate images array
        // Note: adImages can be either base64 encoded strings or Firebase Storage URLs
        if (!payload.adImages || !Array.isArray(payload.adImages) || payload.adImages.length < 1 || payload.adImages.length > 5) {
            return res.status(400).json({message: 'Minimum 1 and maximum 5 ad images are required'});
        }

        // Validate placementPages if provided
        if (payload.placementPages) {
            if (!Array.isArray(payload.placementPages) || payload.placementPages.length === 0) {
                return res.status(400).json({message: 'placementPages must be a non-empty array'});
            }
            const validPages = ['home', 'news', 'service', 'property', 'job', 'matrimony', 'vehicle', 'offer', 'editor'];
            const invalidPages = payload.placementPages.filter(page => !validPages.includes(page));
            if (invalidPages.length > 0) {
                return res.status(400).json({message: `Invalid placement pages: ${invalidPages.join(', ')}`});
            }
        } else {
            // Default to home page if not specified
            payload.placementPages = ['home'];
        }

        // All ads are auto-approved, admin can only delete
        payload.userId = req.user._id;
        payload.isVerified = true;
        payload.status = 'Approved';

        // Store payment reference if provided (optional for backward compatibility)
        // Frontend should send paymentId after successful payment verification
        if (payload.paymentId) {
            // Validate that the payment exists and belongs to the user
            const Payment = require('../model/paymentModel');
            const payment = await Payment.findById(payload.paymentId);

            if (!payment) {
                return res.status(400).json({
                    message: 'Invalid payment reference',
                    status: 400,
                    success: false,
                    error: true
                });
            }

            if (payment.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: 'Unauthorized: Payment does not belong to user',
                    status: 403,
                    success: false,
                    error: true
                });
            }

            if (payment.status !== 'success') {
                return res.status(400).json({
                    message: 'Payment not successful. Please complete payment first.',
                    status: 400,
                    success: false,
                    error: true
                });
            }

            // Ensure payment is for an ad plan (category: 'ads')
            if (payment.planCategory !== 'ads') {
                return res.status(400).json({
                    message: 'Payment is not for an ad plan',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }

        const newAd = new adModel(payload);
        const result = await newAd.save();
        let user = await userModel.findById(req.user._id);
        if(user.AnyServiceCreate === false)
        {
          user.AnyServiceCreate = true;
          await user.save();
        }

        res.json({
            message: 'Ad created successfully',
            status: 200,
            data: result,
            success: true,
            error: false
        });

    } catch (e) {
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

// get all adds
const GetAllAdds = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query filter
        let queryFilter = { isVerified: true, status: 'Approved' };
        // Exclude current user's ads if user is logged in
        if (req.user && req.user._id) {
            queryFilter.userId = { $nin: [req.user._id] };
        }
        if (req.query.adPlanType) {
            queryFilter.adPlanType = req.query.adPlanType;
        }
        if (req.query.placementPage) {
            queryFilter.placementPages = req.query.placementPage;
        }
        if (req.query.pincode) {
            queryFilter.pincode = req.query.pincode;
        }
        const result = await adModel.find(queryFilter).skip(skip).limit(limit);
        const total = await adModel.countDocuments(queryFilter);
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Ads retrieved successfully',
            status: 200,
            data: result,
            total,
            totalPages,
            currentPage: page,
            success: true,
            error: false
        });
    } catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

// get specific add
const GetSpecificAdd = async (req, res) => {
    try {       
        let id = req.params.id;
        const result = await adModel.findById(id);
        
        if (!result) {
            return res.status(404).json({
                message: 'Ad not found', 
                status: 404, 
                data: {}, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Ad retrieved successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    } catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

//get all adds by user id
const getAllAdUser = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let placementPage = req.query.placementPage; // Optional filter by placement page
        let adPlanType = req.query.adPlanType; // Optional filter by ad plan type (e.g., 'banner' for home page)
        let pincode = req.query.pincode; // Optional filter by pincode for location-based ads and sorting
        const skip = (page - 1) * limit;

        // Build query filter
        let queryFilter = { status: 'Approved', isActive: true };
        if (placementPage) {
            queryFilter.placementPages = placementPage;
        }
        if (adPlanType) {
            queryFilter.adPlanType = adPlanType;
        }

        // Fetch all results without pincode filtering (we'll sort by distance instead)
        let result = await adModel.find(queryFilter);

        // Sort by distance from user's pincode if provided (nearest first)
        if (pincode) {
            result = result.sort((a, b) => {
                const distanceA = calculatePincodeDistance(pincode, a.pincode);
                const distanceB = calculatePincodeDistance(pincode, b.pincode);
                return distanceA - distanceB;
            });
        }

        // Apply pagination after sorting
        const total = result.length;
        const totalPages = Math.ceil(total / limit);
        result = result.slice(skip, skip + parseInt(limit));

        res.json({message: 'Ads retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

//send notification userId who not crate add post 
const sendNotificationToAddPoster = async (req, res) => {
    try {

        if (req.user.role !== 'ADMIN') {
            return res.json({
                message: 'Not authorized',
                status: 500,
                success: false,
                error: true
            });
        }
        // Get all users used in add table
        const addUsers = await adModel.distinct("userId");
        // Find only users not used in add model
        const result = await userModel.find(
            { _id: { $nin: addUsers } },
            { _id: 1, name: 1, email: 1, phone: 1 }  // return only 4 fields
        );
        res.json({
            message: 'Users without add fetched',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }

};


// update specific add
const UpdateSpecificAdd = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistAd = await adModel.findById(id);
        if (!ExistAd) {
            return res.status(404).json({message: 'Ad not found'});
        }
        
        let UserId = req.user._id;
        if (ExistAd.userId.toString() !== UserId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        if(payload.isVerified===true ){
            if(req.user.role !== 'ADMIN'){
                return res.status(403).json({message: 'Unauthorized access'});
            }
         }
         

        // Validate images array if being updated
        // Note: adImages can be either base64 encoded strings or Firebase Storage URLs
        if (payload.adImages && (!Array.isArray(payload.adImages) || payload.adImages.length < 1 || payload.adImages.length > 5)) {
            return res.status(400).json({message: 'Minimum 1 and maximum 5 ad images are required'});
        }

        const result = await adModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Ad updated successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    } catch (e) {
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};


let getAllNotVerifiedAdds = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        // No longer used: all ads are auto-approved
        res.json({message: 'All ads are auto-approved. No unverified ads.', status: 200, data: [], success: true, error: false, total: 0, totalPages: 0});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};



// delete specific add
const DeleteSpecificAdd = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistAd = await adModel.findById(id);
        if (!ExistAd) {
            return res.status(404).json({message: 'Ad not found'});
        }
        
        if (ExistAd.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        const result = await adModel.findByIdAndDelete(id);
        
        res.json({
            message: 'Ad deleted successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    } catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};


//get filter adds by all field
const FilterAdds = async (req, res) => {
    try {
        // Extract query parameters
        const {
            category,       // selectCategory
            route,          // selectSubCategory (legacy)
            position,       // selectSubCategory (legacy)
            placementPage,  // NEW: filter by placement page
            pincode,        // NEW: filter by pincode for location-based ads and sorting
            isActive,       // selectSubCategory
            validTill,      // selectSubCategory
            location,       // selectSubCategory
            isVerified,     // selectSubCategory
            search,         // selectSubCategory
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build dynamic filter object
        const filter = {};

        // Only add filters if parameters are provided
        if (category) {
            filter.category = category;
        }
        // Filter by placement page (user-controlled)
        if (placementPage) {
            filter.placementPages = placementPage;
        }
        // Note: We don't filter by exact pincode match anymore
        // Instead, we fetch all results and sort by distance

        // Legacy filters - kept for backward compatibility
        if (route) {
            filter.route = route;
        }
        if (position) {
            filter.position = position;
        }
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        if (validTill) {
            filter.validTill = validTill;
        }
        if (location) {
            filter.location = location;
        }
        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }
        if (search) {
            filter.$text = {$search: search};
        }

        // Pagination setup
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with filters and populate
        let result = await adModel
            .find(filter)
            .populate('userId', 'name email phone profileImage');

        // Sort by distance from user's pincode if provided (nearest first)
        if (pincode) {
            result = result.sort((a, b) => {
                const distanceA = calculatePincodeDistance(pincode, a.pincode);
                const distanceB = calculatePincodeDistance(pincode, b.pincode);
                return distanceA - distanceB;
            });
        } else {
            // Apply default sorting if no pincode provided
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
            result = result.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];
                if (sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        // Apply pagination after sorting
        const total = result.length;
        const totalPages = Math.ceil(total / limitNum);
        result = result.slice(skip, skip + limitNum);

        res.json({
            message: 'Adds retrieved successfully',
            status: 200,
            data: result,
            total,
            totalPages,
            currentPage: pageNum,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

//total count
const getTotalAdCount = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        let totalAdCount = await adModel.countDocuments();
        res.json({
            message: 'Total ad count retrieved successfully',
            status: 200,
            data: totalAdCount,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};


// query adds
const queryAdds = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search across multiple fields
        const searchQuery = {
            $or: [
                { title: regexQuery },
                { description: regexQuery },
                { category: regexQuery },
                { location: regexQuery },
                { status: regexQuery },
            ]
        };
        
        const result = await adModel.find(searchQuery).skip(skip).limit(limit);
        const total = await adModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Ads retrieved successfully', 
            status: 200, 
            data: result,
            total,
            totalPages,
            currentPage: page,
            success: true, 
            error: false
        });
    } catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};


 


// view add creaetr
const AddCreaterView = async (req, res) => {
    try {  
        let userId=req.user._id;
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await adModel.find({userId:userId}).skip(skip).limit(limit);
        const total = await adModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Add created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};
const specificAddAdminView = async (req, res) => {
    try {  
        let id=req.params.id;
        let result=await adModel.find({userId:id});
        if(!result){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        res.json({message: 'Add detail retrieved successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};



module.exports = {CreateAdd,getAllAdUser,sendNotificationToAddPoster, GetAllAdds,getTotalAdCount, GetSpecificAdd, UpdateSpecificAdd, DeleteSpecificAdd, queryAdds,specificAddAdminView, AddCreaterView,getAllNotVerifiedAdds,FilterAdds};
