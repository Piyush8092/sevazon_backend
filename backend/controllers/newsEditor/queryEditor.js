let editorModel = require('../../model/EditorModel');

const queryEditors = async (req, res) => {
    try {
        let query = req.query.query;
        let userId = req.query.userId; // Support filtering by userId

        // If userId is provided, search by userId directly
        if (userId) {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const result = await editorModel.find({ userId: userId }).skip(skip).limit(limit).populate('userId', 'name email ');
            const total = await editorModel.countDocuments({ userId: userId });
            const totalPages = Math.ceil(total / limit);

            if(!result || result.length === 0){
                return res.status(404).json({message: 'No editors found for this user'});
            }

            return res.json({
                message: 'Editors retrieved successfully',
                status: 200,
                data: result,
                total,
                totalPages,
                currentPage: page,
                success: true,
                error: false
            });
        }

        // Original query-based search
        if (!query) {
            return res.status(400).json({message: 'Query or userId parameter is required'});
        }

        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Search across multiple fields based on the EditorModel
        const searchQuery = {
            $or: [
                { yourNameChannelMedia: regexQuery },
                { userName: regexQuery },
                { yourBio: regexQuery },
                { yourEmail: regexQuery },
                { pincode: regexQuery },
                { aboutYourself: regexQuery },
                { socialMediaIdLink: regexQuery },
                { referralUserId: regexQuery },
                { title: regexQuery },
                { content: regexQuery },
            ]
        };

        const result = await editorModel.find(searchQuery).skip(skip).limit(limit).populate('userId', 'name email ');
        const total = await editorModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        if(!result || result.length === 0){
            return res.status(404).json({message: 'No editors found'});
        }

        if(page < 1){
            return res.status(400).json({message: 'Invalid page number'});
        }

        if(page > totalPages){
            return res.status(400).json({message: 'Page number exceeds total pages'});
        }

        res.json({
            message: 'Editors retrieved successfully',
            status: 200,
            data: result,
            total,
            totalPages,
            currentPage: page,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { queryEditors };
