 let jobModel = require('../../model/jobmodel');
    const updateFavourit = async (req, res) => {
        try {       
            let id = req.params.id;
            let userId = req.user._id;
            let payload = req.body;
            let ExistJob = await jobModel.findById(id);
            if (!ExistJob) {
                return res.status(404).json({message: 'Job not found'});
            }
            const isAlreadyFavourite = ExistJob.favoriteJob.some(
                favorite => favorite.userId.toString() === userId.toString()
            );
            if (isAlreadyFavourite) {
                return res.status(400).json({message: 'Already favourite'});
            }
            if(payload.isFavorite === false){
                ExistJob.favoriteJob = ExistJob.favoriteJob.filter(
                    favorite => favorite.userId.toString() !== userId.toString()
                );
                const result = await ExistJob.save();
                res.json({
                    message: 'Job unfavourited successfully', 
                    status: 200, 
                    data: result, 
                    success: true, 
                    error: false
                });
                return;
            }
            if(payload.isFavorite !== true){
                return res.status(400).json({message: 'Invalid payload'});
            }
            ExistJob.favoriteJob.push({ userId: userId });
            const result = await ExistJob.save();
            
            res.json({
                message: 'Job favourited successfully', 
                status: 200, 
                data: result, 
                success: true, 
                error: false
            });
        }
        catch (e) {
            res.json({
                message: 'Something went wrong', 
                status: 500, 
                data: e.message, 
                success: false, 
                error: true
            });
        }
    };
    module.exports = { updateFavourit };

