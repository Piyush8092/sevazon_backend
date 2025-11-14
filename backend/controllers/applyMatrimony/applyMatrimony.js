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
    let existingApplication = await MatrimonyModel.findOne({
        'applyMatrimony.applyUserId': userId,
        'applyMatrimony.applyMatrimonyStatus': true,
    });
    if(existingApplication){
        return res.status(400).json({message: 'You have already applied to this profile'});
    }
    ExistMatrimony.applyMatrimony.push({applyUserId: userId, applyMatrimonyStatus: true, status: 'Pending'});

    await ExistMatrimony.save();
    res.json({message: 'Matrimony application submitted successfully', status: 200, data: ExistMatrimony, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }


}

module.exports = { applyMatrimony };
