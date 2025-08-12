let editorModel = require('../../model/EditorModel');

const createEditor = async (req, res) => {
    try {       
        let payload = req.body;
        if (!payload.title || !payload.salary) {
            return res.status(400).json({message: 'All fields are required'});
        }   
let userId=req.user._id;
if(!userId){
    return res.status(400).json({message: 'not specific user exist'});
}
let existUser=await editorModel.findById({_id:userId});
if(!existUser){
    return res.status(400).json({message: 'not specific user exist'});
}
        payload.userId = userId;

        const neweditor = new editorModel(payload);
        const result = await neweditor.save();

        res.json({message: 'editor created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
    };

module.exports = { createEditor };
