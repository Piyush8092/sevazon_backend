let propertyModel = require('../../model/property');
const userModel = require('../../model/userModel');

const UpdatePropertyBookmark = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistProperty = await propertyModel.findById(id);
        if (!ExistProperty) {
            return res.status(404).json({message: 'Property not found'});
        }
        
        if (ExistProperty.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Cannot bookmark your own property'});
        }
        
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Toggle bookmark
        const bookmarkIndex = user.propertyBookmarkID.indexOf(id);
        if (bookmarkIndex > -1) {
            // Remove bookmark
            user.propertyBookmarkID.splice(bookmarkIndex, 1);
            await user.save();
            
            return res.json({
                message: 'Property removed from bookmarks', 
                status: 200, 
                data: user, 
                success: true, 
                error: false
            });
        } else {
            // Add bookmark
            user.propertyBookmarkID.push(id);
            await user.save();
            
            return res.json({
                message: 'Property bookmarked successfully', 
                status: 200, 
                data: user, 
                success: true, 
                error: false
            });
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { UpdatePropertyBookmark };

