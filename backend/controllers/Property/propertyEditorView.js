let PropertyModel = require("../../model/property");

const PropertyEditorView = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      console.error('PropertyEditorView: Missing userId on request.user');
      return res.status(400).json({
        message: 'Unable to identify user',
        status: 400,
        data: [],
        success: false,
        error: true,
      });
    }

    const query = { userId };
    console.log('PropertyEditorView: query =', query, 'page=', page, 'limit=', limit);

    const result = await PropertyModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone postFeatures')
      .lean();

    const total = await PropertyModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log('PropertyEditorView: found', result.length, 'properties for user', userId.toString());

    res.json({
      message: 'Property created successfully',
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
    });
  } catch (e) {
    console.error('PropertyEditorView: error', e);
    res.status(500).json({
      message: 'Something went wrong',
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { PropertyEditorView };
