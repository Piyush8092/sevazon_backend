let jobModel = require('../../model/jobmodel');

const queryJobs = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search across multiple fields based on the job model
        const searchQuery = {
            $or: [
                { yourProfileId: regexQuery },
                { title: regexQuery },
                { yourNameBusinessInstituteFirmCompany: regexQuery },
                { selectCategory: regexQuery },
                { selectSubCategory: regexQuery },
                { subCategoryOther: regexQuery },
                { address: regexQuery },
                { pincode: regexQuery },
                { description: regexQuery },
                { requiredExperience: regexQuery },
                { workShift: { $in: [regexQuery] } },
                { workMode: { $in: [regexQuery] } },
                { workType: { $in: [regexQuery] } },
                { salaryPer: regexQuery }
            ]
        };
        
        const result = await jobModel.find(searchQuery).skip(skip).limit(limit);
        const total = await jobModel.countDocuments(searchQuery);
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
            message: 'Jobs retrieved successfully', 
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

module.exports = { queryJobs };
