let LocalServiceModel = require('../../model/localServices');
let userModel = require('../../model/userModel');

const sendNotificationToLocalServicesPoster = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.json({
                message: 'Not authorized',
                status: 500,
                success: false,
                error: true
            });
        }
        // Get all users used in local services table
            const localServicesUsers = await LocalServiceModel.distinct("userId");
            // Find only users not used in local services model
            const result = await userModel.find(
                { _id: { $nin: localServicesUsers } },
                { _id: 1, name: 1, email: 1, phone: 1 }  // return only 4 fields
            );
            res.json({
                message: 'Users without local services fetched',
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
module.exports = { sendNotificationToLocalServicesPoster };


