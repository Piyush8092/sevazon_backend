let MatrimonyModel = require('../../model/Matrimony');


const getPendingMatrimony = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    console.log(`[getPendingMatrimony] userId: ${userId}, page: ${page}, limit: ${limit}`);
    const result = await MatrimonyModel.find({
      $and: [
        { userId: userId },
        { 'applyMatrimony.status': 'Pending' }
      ]
    })
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(limit);
    const total = await MatrimonyModel.countDocuments({
      $and: [
        { userId: userId },
        { 'applyMatrimony.status': 'Pending' }
      ]
    });
    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      message: 'All pending applications retrieved successfully',
      data: result,
      total,
      totalPages
    });
  } catch (e) {
    console.error('[getPendingMatrimony] Error:', e);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      data: e.message || e
    });
  }
};

module.exports = { getPendingMatrimony };


