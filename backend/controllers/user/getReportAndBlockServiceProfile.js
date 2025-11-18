 let createServiceModel = require('../../model/createAllServiceProfileModel');

const getReportAndBlockServiceProfile = async (req, res) => {
    try {
         let userId = req.user._id;

         // Find service profiles where the logged-in user has blocked other profiles
         let result = await createServiceModel.find({
             'reportAndBlock': {
                 $elemMatch: {
                     'reportAndBlockID': userId,
                     'block': true
                 }
             }
         }).populate('userId', 'name email phone profileImage ');

         if(!result || result.length === 0){
             return res.json({
                 message: 'No blocked profiles found',
                 status: 404,
                 data: [],
                 success: false,
                 error: true
             });
         }

         res.json({
             message: 'Blocked service profiles retrieved successfully',
             status: 200,
             data: result,
             total: result.length,
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

module.exports = { getReportAndBlockServiceProfile };


