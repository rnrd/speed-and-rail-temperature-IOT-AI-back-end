const express=require("express");
const router=express.Router();
const {verifyJWT}=require("../helpers/HelperFunctions");
//we will define /logout route here.
router.get("/",verifyJWT,(req,res)=>{

    //we will assign our environment information (production or development) to variable from dot.env where we have already defined it.
    const {NODE_ENV}=process.env;

    //then adjust our cookie and we will expire date.
    return res.status(200).cookie({
      httpOnly:true,
      expires:new Date(Date.now()),
      secure:NODE_ENV==="development" ? false : true
    }).json({
        success: true,
        message:"Log out is successful"
    })


})

module.exports=router;