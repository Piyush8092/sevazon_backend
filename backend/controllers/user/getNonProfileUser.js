 let userModel = require('../../model/userModel');
  
    const getNonProfileUser = async (req, res) => {
        try {  
            if(req.user.role !== 'ADMIN'){
                return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
            }
            let result = await userModel.find({AnyServiceCreate:false});
            if(!result || result.length === 0){
                return res.json({
                    message: 'No non-profile users found',
                    status: 404,
                    data: [],
                    success: false,
                    error: true
                });
            }
            //i need only name and email and phone number
            result = result.map((item) => ({
                name: item.name,
                email: item.email,
                phone: item.phone,
                userId: item._id
            }));
            res.json({
                message: 'Non-profile users retrieved successfully',
                status: 200,
                data: result,
                total: result.length,
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
    
    module.exports = { getNonProfileUser };

