let jobModel = require('../../model/jobmodel');
const notificationService = require('../../services/notificationService');
const notificationTriggers = require('../../services/notificationTriggers');

const sendNotificationToJobPoster = async (req, res) => {
    try {
        const job = await jobModel.find();

        const userIds = job.map(job => job.userId);
        const uniqueUserIds = [...new Set(userIds)];
        const title = 'New Job Post';
        const body = 'A new job has been posted';
        const data = { type: 'new_job_post' };
        const options = { category: 'jobs', type: 'newJobPost', priority: 'normal' };

        const result = await notificationService.sendToMultipleUsers(uniqueUserIds, title, body, data, options);

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


