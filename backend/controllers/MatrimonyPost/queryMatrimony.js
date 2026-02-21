let MatrimonyModel = require('../../model/Matrimony');

const queryMatrimony = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search across multiple fields based on the matrimony model
      const searchQuery = {
  $or: [
    // String fields
    { fullName: regexQuery },
    { phoneNo: regexQuery },
    { profileCreatedFor: regexQuery },
    { gender: regexQuery },
    { maritalStatus: regexQuery },
    { moreAboutYourself: regexQuery },
    { contactNumber: regexQuery },

    // Array fields use $in
    { profession: { $in: [regexQuery] } },
    { highestQualification: { $in: [regexQuery] } },
    { employmentType: { $in: [regexQuery] } },
    { religion: { $in: [regexQuery] } },
    { caste: { $in: [regexQuery] } },
    { subCaste: { $in: [regexQuery] } },
    { motherTongue: { $in: [regexQuery] } },
    { city: { $in: [regexQuery] } },
    { state: { $in: [regexQuery] } },
    { pincode: { $in: [regexQuery] } },
    { height: { $in: [regexQuery] } },
    { annualIncome: { $in: [regexQuery] } },
    { rashiAstroDetails: { $in: [regexQuery] } },

    // Partner Requirements (array fields)
    { partnerReligion: { $in: [regexQuery] } },
    { partnerMotherTongue: regexQuery },
    { partnerMaritalStatus: { $in: [regexQuery] } },
    { partnerCity: { $in: [regexQuery] } },
    { partnerState: { $in: [regexQuery] } },
    { partnerEmploymentType: { $in: [regexQuery] } },
    { partnerRashiAstroDetails: { $in: [regexQuery] } },

    // Partner Height (string fields only - min and max are strings)
    { "partnerHeight.min": regexQuery },
    { "partnerHeight.max": regexQuery }

    // Note: Removed partnerAge.min and partnerAge.max as they are numeric fields
    // and cannot be searched with regex patterns
  ]
};
 
        const result = await MatrimonyModel.find(searchQuery)
            .populate('userId', '_id name email phone')
            .populate('applyMatrimony.applyUserId', '_id name email phone')
            .skip(skip)
            .limit(limit);
        console.log('ankur',result)
        const total = await MatrimonyModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);
        
        if(!result || result.length === 0){
            return res.status(404).json({message: 'No data found'});
        }
        
        if(page < 1){
            return res.status(400).json({message: 'Invalid page number'});
        }
        
        if(page > totalPages){
            return res.status(400).json({message: 'Page number exceeds total pages'});
        }

        res.json({
            message: 'Matrimony profiles retrieved successfully', 
            status: 200, 
            data: result,
            total,
            totalPages,
            currentPage: page,
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

module.exports = { queryMatrimony };
