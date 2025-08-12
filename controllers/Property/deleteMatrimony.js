let PropertyModel = require('../../model/property');

const deleteProperty = async (req, res) => {
    try {       

        let id=req.params.id;
        let userId=req.user._id;
        let ExistProperty=await PropertyModel.findById({_id:id});
        if(!ExistProperty){
            return res.status(400).json({message: 'not specific user exist'});
        }
        if(ExistProperty.userId!=userId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await PropertyModel.findByIdAndDelete({_id:id});
        res.json({message: 'Property created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { deleteProperty };

