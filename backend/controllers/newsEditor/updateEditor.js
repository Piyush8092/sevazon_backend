let editorModel = require('../../model/EditorModel');


// panigind follower sections
const updateEditor = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        let ExistEditor = await editorModel.findById({_id: id});
        
        if (!ExistEditor) {
            return res.status(404).json({message: 'Editor not found'});
        }

        let UserId = req.user._id;
        if (ExistEditor.userId.toString() !== UserId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Handle follow/unfollow actions
        if (payload.action === 'follow' && payload.targetEditorId) {
            // Check if target editor exists
            let TargetEditor = await editorModel.findById(payload.targetEditorId);
            if (!TargetEditor) {
                return res.status(404).json({message: 'Target editor not found'});
            }

            // Add to current editor's following list
            const isAlreadyFollowing = ExistEditor.following.some(
                following => following.following_Id === payload.targetEditorId
            );
            if (!isAlreadyFollowing) {
                ExistEditor.following.push({ following_Id: payload.targetEditorId });
            }

            // Add current editor to target editor's followers list
            const isAlreadyFollower = TargetEditor.followers.some(
                follower => follower.editor_Id === id
            );
            if (!isAlreadyFollower) {
                TargetEditor.followers.push({ editor_Id: id });
                await editorModel.findByIdAndUpdate(payload.targetEditorId, 
                    { followers: TargetEditor.followers }, {new: true});
            }

            payload.following = ExistEditor.following;
            delete payload.action;
            delete payload.targetEditorId;
        } 
        else if (payload.action === 'unfollow' && payload.targetEditorId) {
            // Remove from current editor's following list
            ExistEditor.following = ExistEditor.following.filter(
                following => following.following_Id !== payload.targetEditorId
            );

            // Remove current editor from target editor's followers list
            let TargetEditor = await editorModel.findById(payload.targetEditorId);
            if (TargetEditor) {
                TargetEditor.followers = TargetEditor.followers.filter(
                    follower => follower.editor_Id !== id
                );
                await editorModel.findByIdAndUpdate(payload.targetEditorId, 
                    { followers: TargetEditor.followers }, {new: true});
            }

            payload.following = ExistEditor.following;
            delete payload.action;
            delete payload.targetEditorId;
        }
        // Handle direct followers/following updates
        else if (payload.followers) {
            payload.followers = payload.followers.map(editorId => ({ editor_Id: editorId }));
        }
        else if (payload.following) {
            payload.following = payload.following.map(editorId => ({ following_Id: editorId }));
        }
        else {
            // Preserve existing followers and following if not updating them
            payload.followers = ExistEditor.followers;
            payload.following = ExistEditor.following;
        }

        // Validate userName uniqueness if being updated
        if (payload.userName && payload.userName !== ExistEditor.userName) {
            let existingUserName = await editorModel.findOne({
                userName: payload.userName,
                _id: { $ne: id }
            });
            if (existingUserName) {
                return res.status(400).json({message: 'Username already exists'});
            }
        }

        // Validate email format if being updated
        if (payload.yourEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.yourEmail)) {
                return res.status(400).json({message: 'Invalid email format'});
            }
        }

        // Validate pincode if being updated
        if (payload.pincode) {
            const pincodeRegex = /^[1-9][0-9]{5}$/;
            if (!pincodeRegex.test(payload.pincode)) {
                return res.status(400).json({message: 'Invalid pincode format'});
            }
        }

        const result = await editorModel.findByIdAndUpdate({_id: id}, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Editor updated successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    }
    catch (e) {
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        if (e.code === 11000) {
            return res.status(400).json({
                message: 'Username already exists', 
                status: 400, 
                data: {}, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { updateEditor };
