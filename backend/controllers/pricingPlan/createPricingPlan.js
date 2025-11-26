const PricingPlan = require('../../model/pricingPlanModel');

const createPricingPlan = async (req, res) => {
    try {
        const payload = req.body;

        // Validate required fields
        if (!payload.title || !payload.category || 
            payload.price1 === undefined || payload.price2 === undefined || 
            payload.originalPrice === undefined || 
            payload.duration1 === undefined || payload.duration2 === undefined || 
            payload.perMonth === undefined || !payload.features || payload.features.length === 0) {
            return res.status(400).json({ 
                message: 'All required fields must be provided (title, category, price1, price2, originalPrice, duration1, duration2, perMonth, features)' 
            });
        }

        // Validate category
        const validCategories = ['service-business', 'post', 'ads'];
        if (!validCategories.includes(payload.category)) {
            return res.status(400).json({ 
                message: 'Invalid category. Must be one of: service-business, post, ads' 
            });
        }

        // Create new pricing plan
        const newPlan = new PricingPlan(payload);
       let result = await newPlan.save();
       if(result.PaymentType === 'paid')
       {
         let user = await userModel.findById(req.user._id);
         if(user.primiumUser === false)
         {
          user.primiumUser = true;
          await user.save();
         }
       }

        

        res.status(201).json({
            message: 'Pricing plan created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating pricing plan:', error);
        res.status(500).json({ 
            message: 'Error creating pricing plan', 
            error: error.message 
        });
    }
};

module.exports = { createPricingPlan };

