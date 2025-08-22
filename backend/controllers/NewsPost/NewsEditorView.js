let NewsPostModel = require('../../model/NewsPost');

const NewsEditorView = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let userId=req.user._id;
        const result = await NewsPostModel.find({userId:userId}).skip(skip).limit(limit);
        const total = await NewsPostModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'News created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { NewsEditorView };
