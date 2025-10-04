 const faqModel = require('../../model/FaqModel');

    const updateFaq = async (req, res) => {
        try {       
            let id = req.params.id;
            let payload = req.body;
            let existContact=await faqModel.findById(id);
let userId = req.user._id;
            if(!existContact){
                return res.status(404).json({message: 'Contact not found'});
            }
          if(userId.toString() !== existContact.userId.toString() && req.user.role !== 'ADMIN'){
                return res.status(403).json({message: 'Unauthorized access'});
            }

            const result = await faqModel.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            
            res.json({
                message: 'FAQ updated successfully', 
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

module.exports = { updateFaq };


