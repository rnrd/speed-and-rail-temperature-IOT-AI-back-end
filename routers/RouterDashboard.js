const express=require("express");
const router=express.Router();
const {getSystemDataFromDB, getWeatherData, verifyJWT}=require("../helpers/HelperFunctions");

//we will define /dashboard/ route and we will apply verifyJWT as the middleware of this route
router.get("/",verifyJWT,getSystemDataFromDB);

//we will define /dashboard/weather route and we will apply verifyJWT as the middleware of this route
router.get("/weather",verifyJWT,getWeatherData)


module.exports=router;