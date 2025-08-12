let NewsPostModel = require('../../model/NewsPost');

const deleteNews = async (req, res) => {
    try {       

        let id=req.params.id;
        let userId=req.user._id;
        let ExistNews=await NewsPostModel.findById({_id:id});
        if(!ExistNews){
            return res.status(400).json({message: 'not specific user exist'});
        }
        if(ExistNews.userId!=userId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await NewsPostModel.findByIdAndDelete({_id:id});
        res.json({message: 'News created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { deleteNews };

