const jobModel = require('../../model/jobmodel');

const updateFavourit = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;
    const { isFavorite } = req.body;
 
    // 1️⃣ Check job existence
    const existingJob = await jobModel.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({
        message: 'Job not found',
        success: false,
        error: true,
      });
    }

    // 2️⃣ Check if user already favorited this job
    const existingFavoriteIndex = existingJob.favoriteJob.findIndex(
      (fav) => fav.userId.toString() === userId.toString()
    );

    // 3️⃣ UNFAVORITE CASE
    if (isFavorite === false) {
      if (existingFavoriteIndex === -1) {
        return res.status(400).json({
          message: 'Job is not currently in favorites',
          success: false,
          error: true,
        });
      }

      // remove this user's favorite record
      existingJob.favoriteJob.splice(existingFavoriteIndex, 1);
      const result = await existingJob.save();

      return res.status(200).json({
        message: 'Job unfavorited successfully',
        status: 200,
        success: true,
        error: false,
        data: result,
      });
    }

    // 4️⃣ FAVORITE CASE
    if (isFavorite === true) {
      if (existingFavoriteIndex !== -1) {
        return res.status(400).json({
          message: 'Already favorited',
          success: false,
          error: true,
        });
      }

      existingJob.favoriteJob.push({ userId, isFavorite: true ,jobId: jobId});
      const result = await existingJob.save();

      return res.status(200).json({
        message: 'Job favorited successfully',
        status: 200,
        success: true,
        error: false,
        data: result,
      });
    }

    // 5️⃣ INVALID PAYLOAD
    return res.status(400).json({
      message: 'Invalid payload: isFavorite must be true or false',
      success: false,
      error: true,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Something went wrong',
      status: 500,
      success: false,
      error: true,
      data: err.message,
    });
  }
};

module.exports = { updateFavourit };
