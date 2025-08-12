 const offer = require('../model/OfferModel');
const user = require('../model/userModel');

const createOffer = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate required fields according to OfferModel
        if (!payload.banner_image || !payload.title || !payload.description || !payload.catagory || !payload.location || !payload.vaild_till) {
            return res.status(400).json({message: 'All fields are required'});
        }   
        
        const Role = req.user.role;
        
        // Fix authorization logic (should use && not ||)
        if (Role !== 'OFFER_ADMIN' && Role !== 'SUPER_ADMIN') {
            return res.json({message: 'You are not authorized to create offer', status: 401, data: {}, success: false, error: true});
        }

        payload.varified = true;    
        payload.banner_poster_id = req.user._id;
        
        const newOffer = new offer(payload);
        const result = await newOffer.save();

        res.json({message: 'Offer created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { createOffer };
