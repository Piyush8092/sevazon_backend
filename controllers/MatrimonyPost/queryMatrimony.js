let MatrimonyModel = require('../../model/Matrimony');

const queryMatrimony = async (req, res) => {
        try {       
            let payload = req.body;
            let query = req.query.query;

            if (!query) {
                return res.status(400).json({message: 'All fields are required'});
            }
            let regexQuery=new RegExp(query, 'i');
            let page = req.query.page || 1;
                let limit = req.query.limit || 10;
                const skip = (page - 1) * limit;
                const result = await MatrimonyModel.find({title:regexQuery}).skip(skip).limit(limit);
                const total = await MatrimonyModel.countDocuments({title:regexQuery});
                const totalPages = Math.ceil(total / limit);
                 if(!result){
                    return res.status(400).json({message: 'No data found'});
                }
                if(result.length==0){
                    return res.status(400).json({message: 'No data found'});
                }
                if(result.length<limit){
                    totalPages=page;
                }
                if(totalPages<page){
                    return res.status(400).json({message: 'No data found'});
                }
            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

            }
};

module.exports = { queryMatrimony };
