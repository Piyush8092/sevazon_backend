 let    jobModel = require('../../model/jobmodel');
 const userModel = require('../../model/userModel');
 const UpdateReportAndBlockJob = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        let report = payload.report;
        let block = payload.block;
        let reportAndBlockID = userId;
        let ExistJob = await jobModel.findById(id);
        if (!ExistJob) {
            return res.status(404).json({message: 'Job not found'});
        }
        if (ExistJob.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        //frist check if user already report and block
        const alreadyReported = ExistJob.reportAndBlock.some(
            (r) => r.reportAndBlockID.toString() === userId.toString()
        );
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this profile' });
        }
        ExistJob.reportAndBlock.push({ report: report, block: block, reportAndBlockID: userId });
        const result = await ExistJob.save();
let user = await userModel.findById(userId);

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}
if (user.jobReportAndBlockID.includes(id)) {
    return res.status(400).json({ message: 'You have already reported this profile' });
}
user.jobReportAndBlockID.push(id);
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

module.exports = { UpdateReportAndBlockJob };



