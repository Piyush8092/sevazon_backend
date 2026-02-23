let MatrimonyModel = require('../../model/Matrimony');


const getAcceptMetrimony = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    console.log(`[getAcceptMetrimony] userId: ${userId}, page: ${page}, limit: ${limit}`);
    const result = await MatrimonyModel.find({
      $and: [
        { 'applyMatrimony.applyUserId': userId },
        { 'applyMatrimony.accept': true }
      ]
    })
      .populate('userId', 'name email phone')
      .populate('applyMatrimony.applyUserId', 'name email phone')
      .skip(skip)
      .limit(limit);
    const total = await MatrimonyModel.countDocuments({
      $and: [
        { 'applyMatrimony.applyUserId': userId },
        { 'applyMatrimony.accept': true }
      ]
    });
    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      message: 'All accepted applications retrieved successfully',
      data: result,
      total,
      totalPages
    });
  } catch (e) {
    console.error('[getAcceptMetrimony] Error:', e);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      data: e.message || e
    });
  }
};

module.exports = { getAcceptMetrimony };

