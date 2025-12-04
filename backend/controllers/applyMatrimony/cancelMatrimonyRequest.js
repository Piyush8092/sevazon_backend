let MatrimonyModel = require('../../model/Matrimony');

const cancelMatrimonyRequest = async (req, res) => {
    try {
        let matrimonyId = req.params.id;
        let userId = req.user._id;

        // Find the matrimony profile
        let ExistMatrimony = await MatrimonyModel.findById(matrimonyId);
        if (!ExistMatrimony) {
            return res.status(404).json({
                message: 'Matrimony profile not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Find the application by the current user
        const applicationIndex = ExistMatrimony.applyMatrimony.findIndex(
            app => app.applyUserId.toString() === userId.toString()
        );

        if (applicationIndex === -1) {
            return res.status(404).json({
                message: 'No application found for this profile',
                status: 404,
                success: false,
                error: true
            });
        }

        // Remove the application from the array
        ExistMatrimony.applyMatrimony.splice(applicationIndex, 1);

        // Save the updated matrimony profile
        await ExistMatrimony.save();

        res.json({
            message: 'Matrimony request cancelled successfully',
            status: 200,
            data: ExistMatrimony,
            success: true,
            error: false
        });

    } catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { cancelMatrimonyRequest };

