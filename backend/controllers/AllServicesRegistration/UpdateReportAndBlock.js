const createServiceModel = require('../../model/createAllServiceProfileModel');
const userModel = require('../../model/userModel');

const UpdateReportAndBlock = async (req, res) => {
    try {
        
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        let report = payload.report;
        let block = payload.block;
        let reportAndBlockID = userId;
        let ExistUser = await createServiceModel.findById(id);
        if (!ExistUser) {
            return res.status(404).json({ message: 'Service not found' });
        }
        console.log(userId,ExistUser.userId.toString());
        if (ExistUser.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

//frist check if user already report and block
const alreadyReported = ExistUser.reportAndBlock.some(
    (r) => r.reportAndBlockID.toString() === userId.toString()
);
if (alreadyReported) {
    return res.status(400).json({ message: 'You have already reported this profile' });
} 
        ExistUser.reportAndBlock.push({ report: report, block: block, reportAndBlockID: userId });
        const result = await ExistUser.save();

        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.ServiceReportAndBlockID.includes(id)) {
            return res.status(400).json({ message: 'You have already reported this profile' });
        }
        user.ServiceReportAndBlockID.push(id);
        // console.log("anmdkdk",user.ServiceReportAndBlockID)
        await user.save();
        res.json({
            message: 'Report added successfully',
            status: 200,
            data: result,
            success: true,
            error: false
        });

    } catch (e) {
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { UpdateReportAndBlock };
