let editorModel = require('../../model/EditorModel');

const getAllEditor = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await editorModel.find().skip(skip).limit(limit).populate('userId', 'name email ');
        const total = await editorModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Editor created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllEditor };
