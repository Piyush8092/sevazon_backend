let PropertyModel = require('../../model/property');

const updateProperty = async (req, res) => {
    try {       
        let id=req.params.id;
        let payload = req.body;
let ExistProperty=await PropertyModel.findById({_id:id});
if(!ExistProperty){
    return res.status(400).json({message: 'not specific user exist'});
}

        let UserId=req.user._id;
        if(ExistProperty.userId!=UserId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await PropertyModel.findByIdAndUpdate({_id:id}, payload, {new: true});
        res.json({message: 'Property created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { updateProperty };
