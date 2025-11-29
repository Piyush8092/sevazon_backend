let jobModel = require('../../model/jobmodel');
let userModel=require('../../model/userModel');
const notificationService = require('../../services/notificationService');
const notificationTriggers = require('../../services/notificationTriggers');

const sendNotificationToJobPoster = async (req, res) => {
    try {
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        const user = await userModel.find();
let userIds = user.map(user => user._id);
         const uniqueUserIds = [...new Set(userIds)];
 
        const result =await jobModel.find({userId:{$nin:uniqueUserIds}}).populate('userId', 'name email phone,_id');
 
        res.json({
            message: 'Notifications sent successfully',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Error sending notifications to multiple users:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { sendNotificationToJobPoster };


