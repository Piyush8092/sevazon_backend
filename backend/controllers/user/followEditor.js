let userModel = require('../../model/userModel');
let editorModel = require('../../model/EditorModel');

/**
 * Follow/Unfollow an editor
 * Any user can follow an editor, even if they don't have an editor profile
 */
const followEditor = async (req, res) => {
    try {
        let userId = req.user._id; // Current logged-in user
        let { editorId, action } = req.body; // editorId to follow/unfollow, action: 'follow' or 'unfollow'

        if (!editorId) {
            return res.status(400).json({
                message: 'Editor ID is required',
                status: 400,
                success: false,
                error: true
            });
        }

        if (!action || (action !== 'follow' && action !== 'unfollow')) {
            return res.status(400).json({
                message: 'Action must be either "follow" or "unfollow"',
                status: 400,
                success: false,
                error: true
            });
        }

        // Check if editor exists
        let editor = await editorModel.findById(editorId);
        if (!editor) {
            return res.status(404).json({
                message: 'Editor not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Get current user
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        if (action === 'follow') {
            // Check if already following
            const isAlreadyFollowing = user.followingEditors.some(
                f => f.editorId === editorId
            );

            if (isAlreadyFollowing) {
                return res.json({
                    message: 'Already following this editor',
                    status: 200,
                    data: {
                        followingCount: user.followingEditors.length,
                        followerCount: editor.followers.length
                    },
                    success: true,
                    error: false
                });
            }

            // Add editor to user's following list
            user.followingEditors.push({ editorId: editorId });
            await user.save();

            // Add user to editor's followers list
            const isAlreadyInFollowers = editor.followers.some(
                f => f.editor_Id === userId.toString()
            );
            if (!isAlreadyInFollowers) {
                editor.followers.push({ editor_Id: userId.toString() });
                await editor.save();
            }

            return res.json({
                message: 'Successfully followed editor',
                status: 200,
                data: {
                    followingCount: user.followingEditors.length,
                    followerCount: editor.followers.length,
                    isFollowing: true
                },
                success: true,
                error: false
            });

        } else if (action === 'unfollow') {
            // Remove editor from user's following list
            user.followingEditors = user.followingEditors.filter(
                f => f.editorId !== editorId
            );
            await user.save();

            // Remove user from editor's followers list
            editor.followers = editor.followers.filter(
                f => f.editor_Id !== userId.toString()
            );
            await editor.save();

            return res.json({
                message: 'Successfully unfollowed editor',
                status: 200,
                data: {
                    followingCount: user.followingEditors.length,
                    followerCount: editor.followers.length,
                    isFollowing: false
                },
                success: true,
                error: false
            });
        }

    } catch (e) {
        console.error('Error in followEditor:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { followEditor };

