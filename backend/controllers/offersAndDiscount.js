 const offer = require('../model/OfferModel');
 const userModel = require('../model/userModel');
 const VerifiedPhone = require('../model/verifiedPhoneModel');

// create offer
const createOffer = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate required fields according to new model
        if ( !payload.title || !payload.yourNameBusinessInstituteFirmOrganisation || 
            !payload.selectCategory || !payload.selectSubCategory || !payload.address || 
            !payload.pincode || !payload.description || 
            payload.allowCallInApp === undefined || payload.allowCallViaPhone === undefined || 
            payload.allowChat === undefined || !payload.offerType)
  {
            return res.status(400).json({message: 'All required fields must be provided'});
        }
         // Validate sub-category other when needed
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-Category Other is required when Other is selected'});
        }

        // Validate phone number when call via phone is enabled
        if (payload.allowCallViaPhone === true) {
            if (!payload.phoneNumberForCalls || payload.phoneNumberForCalls.trim() === '') {
                return res.status(400).json({
                    message: 'Phone number is required when call via phone is enabled'
                });
            }

            // Check if phone number is verified (unless it's the user's registered phone)
            const user = await userModel.findById(req.user._id);
            const registeredPhone = user.phone?.toString() || '';
            const cleanedPhone = payload.phoneNumberForCalls.toString().replace(/\D/g, '');
            const last10Digits = cleanedPhone.slice(-10);

            // If it's not the registered phone, check if it's verified
            if (registeredPhone !== last10Digits) {
                const isVerified = await VerifiedPhone.isPhoneVerified(req.user._id, last10Digits);
                if (!isVerified) {
                    return res.status(400).json({
                        message: 'Phone number must be verified via OTP before creating offer. Please verify the phone number first.',
                        status: 400,
                        success: false,
                        error: true,
                        data: {
                            phoneNotVerified: true,
                            phone: last10Digits
                        }
                    });
                }
                console.log(`✅ Alternative phone ${last10Digits} is verified for user ${req.user._id}`);
            } else {
                console.log(`✅ Using registered phone ${registeredPhone} - no verification needed`);
            }
        } else {
            // If call via phone is disabled, set phone number to null
            payload.phoneNumberForCalls = null;
        }

 
        // Validate images array
        // Note: offerDiscountImages can be either base64 encoded strings or Firebase Storage URLs
        if (payload.offerDiscountImages && (!Array.isArray(payload.offerDiscountImages) || payload.offerDiscountImages.length > 2)) {
            return res.status(400).json({message: 'Maximum 2 offer discount images are allowed'});
        }

        payload.userId = req.user._id;

        payload.isVerified = true;

        const newoffer = new offer(payload);
        const result = await newoffer.save();

        let user = await userModel.findById(req.user._id);

        // Update user flags and free post counter
        let userUpdated = false;
        if(user.AnyServiceCreate === false) {
          user.AnyServiceCreate = true;
          userUpdated = true;
        }

        // Increment free post counter if user doesn't have an active subscription
        // Check if user has any active 'post' category subscription
        const Payment = require('../model/paymentModel');
        const now = new Date();
        const activePostSubscription = await Payment.findOne({
            userId: req.user._id,
            status: 'success',
            planCategory: 'post',
            endDate: { $gt: now }
        });

        // If no active subscription, increment free post counter
        if (!activePostSubscription) {
            user.freePostsUsed = (user.freePostsUsed || 0) + 1;
            userUpdated = true;
            console.log(`📊 Free post used: ${user.freePostsUsed}/${user.freePostLimit || 10}`);
        }

        if (userUpdated) {
          await user.save();
        }

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
//all user offer
let     getAllOfferUser = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
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

// get all offers
const GetAllOffer = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query filter - exclude current user's offers if user is logged in
        let queryFilter = {};
        if (req.user && req.user._id) {
            queryFilter = { userId: { $nin: [req.user._id] } };
        }

        const result = await offer.find(queryFilter).skip(skip).limit(limit);
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
        if (Existoffer.userId.toString() !== UserId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : Existoffer.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || Existoffer.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }

            // Check if phone number is verified (unless it's the user's registered phone)
            const user = await userModel.findById(UserId);
            const registeredPhone = user.phone?.toString() || '';
            const cleanedPhone = phoneNumber.toString().replace(/\D/g, '');
            const last10Digits = cleanedPhone.slice(-10);

            // If it's not the registered phone, check if it's verified
            if (registeredPhone !== last10Digits) {
                const isVerified = await VerifiedPhone.isPhoneVerified(UserId, last10Digits);
                if (!isVerified) {
                    return res.status(400).json({
                        message: 'Phone number must be verified via OTP before updating offer. Please verify the phone number first.',
                        status: 400,
                        success: false,
                        error: true,
                        data: {
                            phoneNotVerified: true,
                            phone: last10Digits
                        }
                    });
                }
                console.log(`✅ Alternative phone ${last10Digits} is verified for user ${UserId}`);
            } else {
                console.log(`✅ Using registered phone ${registeredPhone} - no verification needed`);
            }
        } else if (payload.allowCallViaPhone === false) {
            // If call via phone is disabled, set phone number to null
            payload.phoneNumberForCalls = null;
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
        
        if (Existoffer.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
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
//total count
const getTotalOfferCount = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }

        let totalOfferCount = await offer.countDocuments();
        res.json({
            message: 'Total offer count retrieved successfully',
            status: 200,
            data: totalOfferCount,
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

const FilterOffer = async (req, res) => {
    try {
        // Extract query parameters
        const {
            // Basic Info Filters
            title,              // Job title
            offerType,          // yourNameBusinessInstituteFirmCompany

            // Category Filters
            category,           // selectCategory
            subCategory,        // selectSubCategory

            // Location Filters
            address,            // Full address search
            pincode,            // Exact pincode match

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
        if (title) {
            filter.title = new RegExp(title, 'i'); // Case-insensitive search
        }
        if (offerType) {
            filter.offerType = offerType;
        }
        if (category) {
            filter.selectCategory = new RegExp(category, 'i');
        }
        if (subCategory) {
            filter.selectSubCategory = new RegExp(subCategory, 'i');
        }

        if (address) {
            filter.address = new RegExp(address, 'i');
        }
        if (pincode) {
            filter.pincode = pincode;
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { yourNameBusinessInstituteFirmOrganisation: new RegExp(search, 'i') },
                { selectCategory: new RegExp(search, 'i') },
                { selectSubCategory: new RegExp(search, 'i') },
                { subCategoryOther: new RegExp(search, 'i') },
                { address: new RegExp(search, 'i') },
                { pincode: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        
            filter.isActive = true;
        }
    
        // Pagination setup
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Sorting setup
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
      
        const result = await offer
            .find(filter)
            .populate('userId', 'name email phone profileImage')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
            const total = await offer.countDocuments(filter);
            const totalPages = Math.ceil(total / limitNum);

        res.json({
            message: 'Offers retrieved successfully', 
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

const specificOfferAdminView = async (req, res) => {
    try {  
        let id=req.params.id;
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        let ExistUser = await userModel.findById(id);
        // console.log(ExistUser);
        if (!ExistUser) {
            return res.status(404).json({message: 'User not found'});
        }
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        let result=await offer.find({userId:id});
        if(!result){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        res.json({message: 'Offer detail retrieved successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }

};
//send notification userId who not crate offer post 
const sendNotificationToOfferPoster = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.json({
                message: 'Not authorized',
                status: 500,
                success: false,
                error: true
            });
        }
        // Get all users used in offer table
        const offerUsers = await offer.distinct("userId");
        // Find only users not used in offer model
        const result = await userModel.find(
            { _id: { $nin: offerUsers } },
            { _id: 1, name: 1, email: 1, phone: 1 }  // return only 4 fields
        );
        res.json({
            message: 'Users without offer fetched',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};



module.exports = { createOffer, GetAllOffer, getAllOfferUser, sendNotificationToOfferPoster,   GetSpecificOffer, getTotalOfferCount,
  specificOfferAdminView,UpdateSpecificOffer, DeleteSpecificOffer, queryOffer, showCreateOfferView ,FilterOffer};
