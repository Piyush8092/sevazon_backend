 const adModel = require('../model/adModel');
 const userModel = require('../model/userModel');
 
// create ads
const CreateAdd = async (req, res) => {
    try {       
        let payload = req.body;
        
     
        // Validate images array
        if (!payload.adImages || !Array.isArray(payload.adImages) || payload.adImages.length < 1 || payload.adImages.length > 5) {
            return res.status(400).json({message: 'Minimum 1 and maximum 5 ad images are required'});
        }

        // Verification is optional - set isVerified based on user's KYC status
        // This allows unverified users to post, but marks their posts accordingly
        const isUserVerified = req.user.isKycVerified || false;

        payload.userId = req.user._id;
        payload.isVerified = isUserVerified;
        payload.status = 'Pending';
        
        const newAd = new adModel(payload);
        const result = await newAd.save();
        let user = await userModel.findById(userId);
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
        
        const result = await adModel.find({$and:[{userId:{$nin: [req.user._id]},isVerified:true}]}).skip(skip).limit(limit);
        const total = await adModel.countDocuments();
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
        const result = await adModel.find({isVerified: false}).skip(skip).limit(limit);
        const total = await adModel.countDocuments({isVerified: false});
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Not verified adds retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
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
            route,          // selectSubCategory
            position,       // selectSubCategory
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

        // Sorting setup
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with filters, pagination, and sorting
        const result = await adModel
            .find(filter)
            .populate('userId', 'name email phone profileImage')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
            const total = await adModel.countDocuments(filter);
            const totalPages = Math.ceil(total / limitNum);

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
        
        if (!result || result.length === 0) {
            return res.status(404).json({message: 'No data found'});
        }
        
        if (page < 1) {
            return res.status(400).json({message: 'Invalid page number'});
        }
        
        if (page > totalPages) {
            return res.status(400).json({message: 'Page number exceeds total pages'});
        }

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



module.exports = {CreateAdd, GetAllAdds,getTotalAdCount, GetSpecificAdd, UpdateSpecificAdd, DeleteSpecificAdd, queryAdds,specificAddAdminView, AddCreaterView,getAllNotVerifiedAdds,FilterAdds};
