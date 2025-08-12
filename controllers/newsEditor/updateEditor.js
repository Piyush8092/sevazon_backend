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

        // Handle followers array management
        if (payload.action === 'add_follower' && payload.followerId) {
            // Add new follower if not already exists
            const isAlreadyFollowing = ExistEditor.followers.some(
                follower => follower.userId === payload.followerId
            );
            
            if (!isAlreadyFollowing) {
                ExistEditor.followers.push({ userId: payload.followerId });
            }
            delete payload.action;
            delete payload.followerId;
        } 
        else if (payload.action === 'remove_follower' && payload.followerId) {
            // Remove follower
            ExistEditor.followers = ExistEditor.followers.filter(
                follower => follower.userId !== payload.followerId
            );
            delete payload.action;
            delete payload.followerId;
        }
        else if (payload.followers) {
            // Direct followers array update
            payload.followers = payload.followers.map(followerId => ({ userId: followerId }));
        }
        else {
            // Preserve existing followers if not updating them
            payload.followers = ExistEditor.followers;
        }
        
        const result = await editorModel.findByIdAndUpdate({_id: id}, payload, {new: true});
        res.json({message: 'Editor updated successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { updateEditor };
