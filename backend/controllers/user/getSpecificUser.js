const userModel = require('../../model/userModel'); // ✅ correct import

const getSpecificUser = async (req, res) => {
    try {  
        const id = req.params.id;

        const result = await userModel
            .findById(id)
            .populate('serviceProfileBookmarkID', 'name email phone profileImage businessName profileType serviceType _id').populate('reportAndBlockID', 'name email phone profileImage businessName profileType serviceType _id');

        if (!result) {
            return res.status(404).json({
                message: 'No data found',
                status: 404,
                data: {},
                success: false,
                error: true
            });
        }

        res.status(200).json({
            message: 'User detail retrieved successfully',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    } 
    catch (e) {
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getSpecificUser };
