let MatrimonyModel = require('../../model/Matrimony');

const UpdateReportAndBlockMatrimony = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        let report = payload.report;
        let block = payload.block;
        let reportAndBlockID = userId;
        let ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({message: 'Matrimony profile not found'});
        }
        if (ExistMatrimony.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        //frist check if user already report and block
        const alreadyReported = ExistMatrimony.reportAndBlock.some(
            (r) => r.reportAndBlockID.toString() === userId.toString()
        );
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this profile' });
        }

        // Use findByIdAndUpdate to avoid full document validation
        const result = await MatrimonyModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    reportAndBlock: {
                        report: report,
                        block: block,
                        reportAndBlockID: userId
                    }
                }
            },
            {
                new: true, // Return the updated document
                runValidators: false // Skip validation to avoid phoneNo requirement
            }
        );

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

module.exports = { UpdateReportAndBlockMatrimony };


