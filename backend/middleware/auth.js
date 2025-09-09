const jwt=require('jsonwebtoken');
const userModel = require('../model/userModel');

const authGuard= async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:'Unauthorized'});
        }
        const ExistUser=jwt.verify(token,process.env.SECRET_KEY ||'me333enneffiimsqoqomcngfehdj3idss');
        // console.log(ExistUser)
        if(!ExistUser.id){
            return res.status(401).json({message:'Unauthorized'});
        }
        const user=await userModel.findOne({_id:ExistUser.id});
        //  console.log(user)
        req.user=user;
        next();
    }
    catch(e){
        res.status(401).json({message:'Unauthorized'});
    }
}
module.exports=authGuard;
