let NewsPostModel = require('../../model/NewsPost');
let userModel = require('../../model/userModel');

const sendNotificationToNewsPoster = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.json({
                message: 'Not authorized',
                status: 500,
                success: false,
                error: true
            });
        }
        // Get all users used in news post table
        const newsUsers = await NewsPostModel.distinct("userId");
        // Find only users not used in news post model
        const result = await userModel.find(
            { _id: { $nin: newsUsers } },
            { _id: 1, name: 1, email: 1, phone: 1 }  // return only 4 fields
        );
        res.json({
            message: 'Users without news post fetched',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }

};
module.exports = { sendNotificationToNewsPoster };



