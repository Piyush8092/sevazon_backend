const FeedbackModel = require('../../model/feedbackModel');

const createFeedback = async (req, res) => {
    try {
        const payload = req.body;
        
        // Validate required fields
        if (!payload.email || !payload.phone || !payload.message) {
            return res.status(400).json({
                message: 'Email, phone, and message are required',
                status: 400,
                success: false,
                error: true
            });
        }
        
        // Add user ID from authenticated user
        payload.userId = req.user._id;
        
        // Create new feedback
        const newFeedback = new FeedbackModel(payload);
        const result = await newFeedback.save();
        
        // Populate user details
        await result.populate('userId', 'name email phone');
        
        res.json({
            message: 'Feedback submitted successfully',
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

module.exports = { createFeedback };

