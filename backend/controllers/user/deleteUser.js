let userModel = require('../../model/userModel');

const deleteUser = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;

        let ExistUser = await userModel.findById(id);
        if (!ExistUser) {
            return res.status(404).json({message: 'User not found'});
        }

       let UserRole=req.user.role;
       if(UserRole!=='ADMIN'){
        return res.status(403).json({message: 'Unauthorized access'});
       }

        const result = await userModel.findByIdAndDelete(id);
        
        res.json({
            message: 'User deleted successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { deleteUser };

