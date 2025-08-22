let userModel = require('../../model/userModel');

const updateUser = async (req, res) => {
    try {           
        let id = req.params.id;
        let payload = req.body;
        let ExistUser = await userModel.findById(id);
        if (!ExistUser) {
            return res.status(404).json({message: 'User not found'});
        }

        let UserRole   = req.user.role;
         if (UserRole !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await userModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'User updated successfully', 
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

module.exports = { updateUser };

