let editorModel = require('../../model/EditorModel');

const updateFollower = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;

        let ExistEditor = await editorModel.findById({_id: id});
        if (!ExistEditor) {
            return res.status(400).json({message: 'Editor not found'});
        }

        // Handle followers and following management
        if (payload.action === 'add_follower' && payload.followerId) {
            // Add new follower to current editor
            const isAlreadyFollowing = ExistEditor.followers.some(
                follower => follower.editor_Id === payload.followerId
            );
            if (!isAlreadyFollowing) {
                ExistEditor.followers.push({ editor_Id: payload.followerId });
            }

            // Add current editor to follower's following list
            let FollowerEditor = await editorModel.findById({_id: payload.followerId});
            if (FollowerEditor) {
                const isAlreadyInFollowing = FollowerEditor.following.some(
                    following => following.following_Id === id
                );
                if (!isAlreadyInFollowing) {
                    FollowerEditor.following.push({ following_Id: id });
                    await editorModel.findByIdAndUpdate({_id: payload.followerId}, 
                        { following: FollowerEditor.following }, {new: true});
                }
            }

            delete payload.action;
            delete payload.followerId;
        } 
        else if (payload.action === 'remove_follower' && payload.followerId) {
            // Remove follower from current editor
            ExistEditor.followers = ExistEditor.followers.filter(
                follower => follower.editor_Id !== payload.followerId
            );

            // Remove current editor from follower's following list
            let FollowerEditor = await editorModel.findById({_id: payload.followerId});
            if (FollowerEditor) {
                FollowerEditor.following = FollowerEditor.following.filter(
                    following => following.following_Id !== id
                );
                await editorModel.findByIdAndUpdate({_id: payload.followerId}, 
                    { following: FollowerEditor.following }, {new: true});
            }

            delete payload.action;
            delete payload.followerId;
        }
        else if (payload.followers) {
            // Direct followers array update
            payload.followers = payload.followers.map(followerId => ({ editor_Id: followerId }));
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

module.exports = { updateFollower };
