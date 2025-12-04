let MatrimonyModel = require('../../model/Matrimony');

const applyMatrimony = async (req, res) => {
try{
    let id=req.params.id;
    let userId = req.user._id;
    let ExistMatrimony = await MatrimonyModel.findById(id);
    if(!ExistMatrimony){
        return res.status(400).json({message: 'not specific user exist'});
    }
    if(ExistMatrimony.userId.toString() === userId.toString() ){
        return res.status(400).json({message: 'You cannot apply to your own profile'});
    }

    // Check if user has already applied to THIS specific profile
    const existingApplicationIndex = ExistMatrimony.applyMatrimony.findIndex(
        app => app.applyUserId.toString() === userId.toString()
    );

    if(existingApplicationIndex !== -1){
        const existingApp = ExistMatrimony.applyMatrimony[existingApplicationIndex];

        // If the previous application was rejected, remove it and allow re-applying
        if(existingApp.reject === true || existingApp.status === 'Rejected'){
            ExistMatrimony.applyMatrimony.splice(existingApplicationIndex, 1);
            // Continue to add new application below
        }
        // If the application is pending or accepted, don't allow duplicate
        else if(existingApp.status === 'Pending' || existingApp.accept === true || existingApp.status === 'Accepted'){
            return res.status(400).json({message: 'You have already applied to this profile'});
        }
    }

    // Add new application
    ExistMatrimony.applyMatrimony.push({applyUserId: userId, applyMatrimonyStatus: true, status: 'Pending', reject: false, accept: false});

    await ExistMatrimony.save();
    res.json({message: 'Matrimony application submitted successfully', status: 200, data: ExistMatrimony, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }


}

module.exports = { applyMatrimony };
