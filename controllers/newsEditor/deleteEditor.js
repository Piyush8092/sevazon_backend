let editorModel = require('../../model/EditorModel');

const deleteEditor = async (req, res) => {
    try {       

        let id=req.params.id;
        let userId=req.user._id;
        let ExistEditor=await editorModel.findById({_id:id});
        if(!ExistEditor){
            return res.status(400).json({message: 'not specific user exist'});
        }
        if(ExistEditor.userId!=userId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await editorModel.findByIdAndDelete({_id:id});
        res.json({message: 'Editor created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { deleteEditor };

