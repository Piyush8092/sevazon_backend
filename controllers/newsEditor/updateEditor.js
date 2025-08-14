let editorModel = require('../../model/EditorModel');


// panigind follower sections
const updateEditor = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        let ExistEditor = await editorModel.findById({_id: id});
        
        if (!ExistEditor) {
            return res.status(400).json({message: 'Editor not found'});
        }

        let UserId = req.user._id;
        if (ExistEditor.userId.toString() !== UserId.toString()) {
            return res.status(400).json({message: 'Unauthorized access'});
        }

       
        
        const result = await editorModel.findByIdAndUpdate({_id: id}, payload, {new: true});
        res.json({message: 'Editor updated successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { updateEditor };
