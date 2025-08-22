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
                { fullName: regexQuery },
                { profession: regexQuery },
                { highestQualification: regexQuery },
                { employmentType: regexQuery },
                { religion: regexQuery },
                { caste: regexQuery },
                { subCaste: regexQuery },
                { motherTongue: regexQuery },
                { city: regexQuery },
                { state: regexQuery },
                { pincode: regexQuery },
                { maritalStatus: regexQuery },
                { height: regexQuery },
                { annualIncome: regexQuery },
                { moreAboutYourself: regexQuery },
                { partnerReligion: regexQuery },
                { partnerMotherTongue: regexQuery },
                { partnerMaritalStatus: { $in: [regexQuery] } }
            ]
        };
        
        const result = await MatrimonyModel.find(searchQuery).skip(skip).limit(limit);
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
