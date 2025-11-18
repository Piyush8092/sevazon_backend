const PricingPlan = require('../../model/pricingPlanModel');

const updatePricingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        // Validate category if provided
        if (payload.category) {
            const validCategories = ['service-business', 'post', 'ads'];
            if (!validCategories.includes(payload.category)) {
                return res.status(400).json({ 
                    message: 'Invalid category. Must be one of: service-business, post, ads' 
                });
            }
        }

        const updatedPlan = await PricingPlan.findByIdAndUpdate(
            id,
            payload,
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ 
                message: 'Pricing plan not found' 
            });
        }

        res.status(200).json({
            message: 'Pricing plan updated successfully',
            data: updatedPlan
        });
    } catch (error) {
        console.error('Error updating pricing plan:', error);
        res.status(500).json({ 
            message: 'Error updating pricing plan', 
            error: error.message 
        });
    }
};

module.exports = { updatePricingPlan };

