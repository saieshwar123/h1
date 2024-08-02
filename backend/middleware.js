const { models } = require("mongoose")
const jwt=require("jsonwebtoken")
const jwtsecret = require("./config")

const authmiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization


    if(!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(403).json({msg:"Wrong User"})
    }
    const token=authHeader.split(" ")[1]

    try
    {
        const decoded=jwt.verify(token,jwtsecret);
        req.userId=decoded.userid;
        next();
    }
    catch(err)
    {
        return res.status(403).json({msg:"Wrong User"})
    }
}

module.exports={authmiddleware}