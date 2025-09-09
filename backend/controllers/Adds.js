 const adModel = require('../model/adModel');
 
// create ads
const CreateAdd = async (req, res) => {
    try {       
        let payload = req.body;
        
     
        // Validate images array
        if (!payload.adImages || !Array.isArray(payload.adImages) || payload.adImages.length < 1 || payload.adImages.length > 5) {
            return res.status(400).json({message: 'Minimum 1 and maximum 5 ad images are required'});
        }
  
        payload.userId = req.user._id;
        payload.isVerified = true;
        payload.status = 'Pending';
        
        const newAd = new adModel(payload);
        const result = await newAd.save();

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
        
        const result = await adModel.find().skip(skip).limit(limit);
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
                { status: regexQuery }
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


module.exports = {CreateAdd, GetAllAdds, GetSpecificAdd, UpdateSpecificAdd, DeleteSpecificAdd, queryAdds, AddCreaterView};
