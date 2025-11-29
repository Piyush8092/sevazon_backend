let createServiceModel = require('../../model/createAllServiceProfileModel');
let userModel = require('../../model/userModel');
const sendNotificationToServicePoster = async (req, res) => {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.json({
                    message: 'Not authorized',
                    status: 500,
                    success: false,
                    error: true
                });
            }
             // Get all users used in create service profile table
            const serviceUsers = await createServiceModel.distinct("userId");
            // Find only users not used in create service profile model
            const result = await userModel.find(
                { _id: { $nin: serviceUsers } },
                { _id: 1, name: 1, email: 1, phone: 1 }  // return only 4 fields
            );

            res.json({
                message: 'Users without create service profile fetched',
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
module.exports = { sendNotificationToServicePoster };


