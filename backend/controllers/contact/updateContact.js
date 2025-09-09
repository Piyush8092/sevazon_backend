let contactModel=require('../../model/contactModel');

    const updateContact = async (req, res) => {
        try {       
            let id = req.params.id;
            let payload = req.body;
            let existContact=await contactModel.findById(id);

            if(!existContact){
                return res.status(404).json({message: 'Contact not found'});
            }
            if(req.user.role !== 'ADMIN'){
                return res.status(403).json({message: 'Unauthorized access'});
            }

            const result = await contactModel.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            
            res.json({
                message: 'Contact updated successfully', 
                status: 200, 
                data: result, 
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

module.exports = { updateContact };


