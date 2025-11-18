const FeedbackModel = require('../../model/feedbackModel');

const getSpecificFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        
        const result = await FeedbackModel.findById(id)
            .populate('userId', 'name email phone')
            .populate('reviewedBy', 'name email');
            
        if (!result) {
            return res.status(404).json({
                message: 'Feedback not found',
                status: 404,
                success: false,
                error: true
            });
        }
        
        res.json({
            message: 'Feedback retrieved successfully',
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

module.exports = { getSpecificFeedback };

