const jobModel = require("../../model/jobmodel");

const FilterJobs = async (req, res) => {
  try {
    // Extract query parameters
    const {
      // Basic Info Filters
      title, // Job title
      company, // yourNameBusinessInstituteFirmCompany

      // Category Filters
      category, // selectCategory
      subCategory, // selectSubCategory

      // Location Filters
      address, // Full address search
      pincode, // Exact pincode match

      // Salary Filters
      minSalary, // Minimum salary (salaryFrom)
      maxSalary, // Maximum salary (salaryTo)
      salaryPer, // 'Per Month', 'Per Year', 'Per Day', 'Per Hour'

      // Experience & Work Filters
      experience, // requiredExperience
      workShift, // 'Day Shift', 'Night Shift'
      workMode, // 'On-site', 'Remote', 'Hybrid'
      workType, // 'Full-time', 'Part-time', 'Intern'

      // Contact Preferences
      allowCallInApp, // true/false
      allowCallViaPhone, // true/false
      allowChat, // true/false

      // Search Query (for text search)
      search,

      // Pagination
      page = 1,
      limit = 10,

      // Sorting
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build dynamic filter object
    const filter = {};

    // Only add filters if parameters are provided
    if (title) {
      filter.title = new RegExp(title, "i"); // Case-insensitive search
    }

    if (company) {
      filter.yourNameBusinessInstituteFirmCompany = new RegExp(company, "i");
    }

    if (category) {
      filter.selectCategory = new RegExp(category, "i");
    }

    if (subCategory) {
      filter.selectSubCategory = new RegExp(subCategory, "i");
    }

    if (address) {
      filter.address = new RegExp(address, "i");
    }

    if (pincode) {
      filter.pincode = pincode;
    }

    if (experience) {
      filter.requiredExperience = new RegExp(experience, "i");
    }

    if (salaryPer) {
      filter.salaryPer = salaryPer;
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      if (minSalary) filter.salaryFrom = { $gte: parseFloat(minSalary) };
      if (maxSalary) filter.salaryTo = { $lte: parseFloat(maxSalary) };
    }

    // Array field filters (workShift, workMode, workType can be arrays)
    if (workShift) {
      filter.workShift = { $in: [workShift] };
    }

    if (workMode) {
      filter.workMode = { $in: [workMode] };
    }

    if (workType) {
      filter.workType = { $in: [workType] };
    }

    // Boolean filters
    if (allowCallInApp !== undefined) {
      filter.allowCallInApp = allowCallInApp === "true";
    }

    if (allowCallViaPhone !== undefined) {
      filter.allowCallViaPhone = allowCallViaPhone === "true";
    }

    if (allowChat !== undefined) {
      filter.allowChat = allowChat === "true";
    }

    // General text search across multiple fields
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { yourNameBusinessInstituteFirmCompany: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { selectCategory: new RegExp(search, "i") },
        { selectSubCategory: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
        { requiredExperience: new RegExp(search, "i") },
      ];
    }

    // Always filter for active jobs
    filter.isActive = true;

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with filters, pagination, and sorting
    const result = await jobModel
      .find(filter)
      .populate("userId", "name email phone profileImage")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await jobModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Response
    res.json({
      message: "Jobs filtered successfully",
      status: 200,
      data: result,
      pagination: {
        total,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      filters: {
        applied: Object.keys(req.query).filter(
          (key) => !["page", "limit", "sortBy", "sortOrder"].includes(key)
        ),
        total: Object.keys(filter).length,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { FilterJobs };
