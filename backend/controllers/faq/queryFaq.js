const faqModel = require("../../model/FaqModel");

const queryFAQ = async (req, res) => {
  try {
    let query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    let regexQuery = new RegExp(query, "i");
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    // Search across name, email, subject, and message fields
    const searchQuery = {
      $or: [{ question: regexQuery }, { answer: regexQuery }],
    };

    const result = await faqModel.find(searchQuery).skip(skip).limit(parseInt(limit));
    const total = await faqModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "FAQ retrieved successfully",
      status: 200,
      data: result,
      total,
      totalPages,
      currentPage: parseInt(page),
      success: true,
      error: false,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { queryFAQ };
