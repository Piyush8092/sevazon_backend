const jwt=require('jsonwebtoken');
const user = require('../model/userModel');

  const authGuard= async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:'Unauthorized'});
        }
        const ExistUser=jwt.verify(token,process.env.SECRET_KEY);
        if(!ExistUser){
            return res.status(401).json({message:'Unauthorized'});
        }
        const user=await user.findById(ExistUser.id);
        req.user=user;
         next();
    }
    catch(e){
        res.status(401).json({message:'Unauthorized'});
    }
}
module.exports=authGuard;