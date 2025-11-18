const PricingPlan = require('../../model/pricingPlanModel');

const getAllPricingPlans = async (req, res) => {
    try {
        const plans = await PricingPlan.find({ isActive: true })
            .sort({ category: 1, displayOrder: 1, createdAt: 1 });

        res.status(200).json({
            message: 'Pricing plans retrieved successfully',
            data: plans,
            count: plans.length
        });
    } catch (error) {
        console.error('Error fetching pricing plans:', error);
        res.status(500).json({ 
            message: 'Error fetching pricing plans', 
            error: error.message 
        });
    }
};

module.exports = { getAllPricingPlans };

