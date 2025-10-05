let createServiceModel = require('../../model/createAllServiceProfileModel');

const getRatting = async (req, res) => {
    try {  
        let id = req.user._id;
         let result = await createServiceModel.findOne({userId: id})
           
         if (!result) {
            return res.status(404).json({
                message: 'No data found',
                status: 404,
                data: {},
                success: false,
                error: true
            });
        }

        // Calculate average rating from comments
        const ratingsOnly = result.comments.filter(comment => comment.ratting && comment.ratting > 0);
        let averageRating = 0;
        let totalRatings = ratingsOnly.length;

        if (totalRatings > 0) {
            const totalRatingSum = ratingsOnly.reduce((sum, comment) => sum + comment.ratting, 0);
            averageRating = (totalRatingSum / totalRatings).toFixed(1);
        }

        console.log(averageRating);
        // Add calculated fields to response
        const responseData = {
            ...result.toObject(),
            averageRating: parseFloat(averageRating),
            totalRatings: totalRatings,
            totalLikes: result.likes.length,
            totalDislikes: result.dislikes.length,
            totalComments: result.comments.length
        };

        
        res.json({
            message: 'Rating retrieved successfully', 
            status: 200, 
            data: responseData, 
            success: true, 
            error: false
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e.message, success: false, error: true});
    }
};

module.exports = { getRatting };


