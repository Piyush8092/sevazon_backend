 const offer = require('../model/OfferModel');

// create offer
const createOffer = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate required fields according to new model
        if ( !payload.title || !payload.yourNameBusinessInstituteFirmOrganisation || 
            !payload.selectCategory || !payload.selectSubCategory || !payload.address || 
            !payload.pincode || !payload.description || 
            payload.allowCallInApp === undefined || payload.allowCallViaPhone === undefined || 
            payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate sub-category other when needed
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-Category Other is required when Other is selected'});
        }

        // Validate phone number when call via phone is enabled
        if (payload.allowCallViaPhone === true && !payload.phoneNumberForCalls) {
            return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
        }

        // Validate images array
        if (payload.offerDiscountImages && (!Array.isArray(payload.offerDiscountImages) || payload.offerDiscountImages.length > 2)) {
            return res.status(400).json({message: 'Maximum 2 offer discount images are allowed'});
        }

        payload.userId = req.user._id;
        payload.isVerified = true;
        
        const newoffer = new offer(payload);
        const result = await newoffer.save();

        res.json({
            message: 'Offer created successfully', 
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

// get all offers
const GetAllOffer = async (req, res) => {
    try {  
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const result = await offer.find().skip(skip).limit(limit);
        const total = await offer.countDocuments();
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            message: 'Offers retrieved successfully', 
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

// get specific offer
const GetSpecificOffer = async (req, res) => {
    try {       
        let id = req.params.id;
        const result = await offer.findById(id);
        
        if (!result) {
            return res.status(404).json({
                message: 'Offer not found', 
                status: 404, 
                data: {}, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Offer retrieved successfully', 
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

// update specific offer
const UpdateSpecificOffer = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let Existoffer = await offer.findById(id);
        if (!Existoffer) {
            return res.status(404).json({message: 'Offer not found'});
        }
        
        let UserId = req.user._id;
        if (Existoffer.userId.toString() !== UserId.toString() || req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : Existoffer.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || Existoffer.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }
        }

        // Validate sub-category other when needed
        const subCategory = payload.selectSubCategory || Existoffer.selectSubCategory;
        if (subCategory === 'Other') {
            const subCategoryOther = payload.subCategoryOther || Existoffer.subCategoryOther;
            if (!subCategoryOther) {
                return res.status(400).json({message: 'Sub-Category Other is required when Other is selected'});
            }
        }

        // Validate images array if being updated
        if (payload.offerDiscountImages && (!Array.isArray(payload.offerDiscountImages) || payload.offerDiscountImages.length > 2)) {
            return res.status(400).json({message: 'Maximum 2 offer discount images are allowed'});
        }

        const result = await offer.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Offer updated successfully', 
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

// delete specific offer
const DeleteSpecificOffer = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let Existoffer = await offer.findById(id);
        if (!Existoffer) {
            return res.status(404).json({message: 'Offer not found'});
        }
        
        if (Existoffer.userId.toString() !== userId.toString() || req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        const result = await offer.findByIdAndDelete(id);
        
        res.json({
            message: 'Offer deleted successfully', 
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

// query offers
const queryOffer = async (req, res) => {
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
                { yourProfileId: regexQuery },
                { yourNameBusinessInstituteFirmOrganisation: regexQuery },
                { selectCategory: regexQuery },
                { selectSubCategory: regexQuery },
                { subCategoryOther: regexQuery },
                { address: regexQuery },
                { pincode: regexQuery },
                { description: regexQuery }
            ]
        };
        
        const result = await offer.find(searchQuery).skip(skip).limit(limit);
        const total = await offer.countDocuments(searchQuery);
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
            message: 'Offers retrieved successfully', 
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

// show create offer view
const showCreateOfferView = async (req, res) => {
    try {   
        let userId = req.user._id;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const result = await offer.find({userId: userId}).skip(skip).limit(limit);
        const total = await offer.countDocuments({userId: userId});
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            message: 'User offers retrieved successfully', 
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

module.exports = { createOffer, GetAllOffer, GetSpecificOffer, UpdateSpecificOffer, DeleteSpecificOffer, queryOffer, showCreateOfferView };
