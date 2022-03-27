const systemParameters = require("../database/SystemParameters");
const axios = require("axios");
const usersModel = require("../database/UsersModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const CustomError=require("../errors/CustomError");
const asyncErrorWrapper=require("express-async-handler");

// syncErrorWrapper is a npm package
// and automatically it sends errors of user defined asynchronous functions to errorController function which we use as a middleware.
//thanks to this package we do not need to write our codes in try-catch block for our user defined asynchronous functions.


//get system data from database
const getSystemDataFromDB = asyncErrorWrapper(async (req, res) => {
    //get last 5 data
    //our data is in systemParameters collection in mongoDB
    //in order to get systeam data we need to use systemParameters.find function.
    //in sort() is for data order and  { _id: -1 } takes the data from end not begining.
    //limit(5) is to restrict number of data that we want to get. Here we wil get only 5 data record.
    const data = await systemParameters.find().sort({ _id: -1 }).limit(5);
    //then we will send the data to client.
    res.send(data);
});

//create user to database
//this function is for creating new user data(record) in database.
//for example: when a user signs up to system this function will run.
const createUserToDB = asyncErrorWrapper(async (req, res) => {
  //we will get neccessary user data from the request coming from client.
  //we know that request does not consist of only data, but also header.
  //we need to get all of these data from body of request.
  //because header carries on some other information such as token.
  const { email, password, registerNumber, validationKey } = req.body;
  //in order to compare validation key sent by client and system validation key, we need an assignment.
  //validation key is in dot.env so we neeed to assign it to a variable.
  const SystemValidationKey = process.env.SYSTEM_VALIDATION_KEY;

  //then writing the conditions.
  if (validationKey === SystemValidationKey) {
    //create user data
    const userData = await usersModel.create({
      email,
      password,
      registerNumber
    });
    //then send response to the client.
    res.status(200).json({
      success: true,
    });
  }
  else{
    res.status(200).json({
      success: false,
    });
  }
});

//get weather conditions
//this function gets weather data from an API outside and returns a response to the client.
const getWeatherData = asyncErrorWrapper (async (req, res) => {
  
    //at first, we will define the URL.
    //the URL is in dot.env, we need to assign it a variable.
    const url = process.env.WEATHER_API_URL;

    //then make get request to weather API and wait for response.
    const apidata = await axios.get(url);

    //then manipulate the response according to our data requirements.
    //response coming from weather API is a json object.
    //we will stringify neccessary data and assign them to variables one by one
    const weatherTemperature = JSON.stringify(apidata.data.main.temp);
    const weatherTemperatureFeel = JSON.stringify(
      apidata.data.main.feels_like
    );
    const weatherTemperatureMin = JSON.stringify(
      apidata.data.main.temp_min
    );
    const weatherTemperatureMax = JSON.stringify(
      apidata.data.main.temp_max
    );
    const weatherHumidity = JSON.stringify(apidata.data.main.humidity);
    const weatherWindSpeed = JSON.stringify(apidata.data.wind.speed);
    const weatherWindDegree = JSON.stringify(apidata.data.wind.deg);
    const weatherType = apidata.data.weather[0].main;
    

    //then we will construct our json object.
    var data = {
      weatherTemperature,
      weatherTemperatureFeel,
      weatherTemperatureMin,
      weatherTemperatureMax,
      weatherHumidity,
      weatherWindSpeed,
      weatherWindDegree,
      weatherType,
    };

    //then send response to the client.
    res.send(data);
  
});

//generating json web token for user authentication 
//this function takes user data coming from client as parameter.
//and return a json web token(jwt)
const generateJWT=(userData)=>{
  
  //jwt.sign creates a token for given user data via jwt scret key that we have already defined in dot.env
  //Also we can pass some options to jwt.sign in a json object.
  //here we will adjust a token expire duration. After expiration time token will be invalid.
  //we have already define expiration duration in dot.env.
  return jwt.sign({data:userData},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRE})
};


//verifiying token.
//this function will check the validation of token coming from the client in request header.
//Also we will use this function as a middleware. For the simple explanation of middleware pls see app.js
//so we will pass next parameter to the function additional to req and res.
const verifyJWT=(req,res,next)=>{

  //at first we will assign token coming from in authorization key of request header to a variable.
  //make sure that the token is in string data type.
  const token=JSON.parse('"'+req.headers.authorization+'"')

  //check the existence of the token.
  if (!token){
  //if token does not exist
  //return response to the client.
    res.json({
        success: false,
        message: "please login"
      })
  }
  else{
    //if token exists then verify it.
    jwt.verify(token,process.env.JWT_SECRET_KEY, (err, value) => {
      if (err) {
        //if err occurs:
        //we will create a custom error and pass message of error and 400 status to this as parameters.
        //we wrap custom error with next and send this to errorController function which we use as a middleware.
        //we do not need to create a custom error, if we write next(err), err is sent to errorController anyway
        //but this error stems from the user so we should return "400 bad request" status.
        return next(new CustomError("please sign up",400))
    }
      else{
        next()
      }
  })
  }
};

//handling log in issue
//this function will also be used as middleware.For the simple explanation of middleware pls see app.js
const logInControl= asyncErrorWrapper(async (req,res,next) => {
 
  //we will get neccessary user data from the request coming from client.
  //we know that request does not consist of only data, but also header.
  //we need to get all of these data from body of request.
  //because header carries on some other information such as token.
  const {email,password}=req.body;

  //then check if the user exists in database via email and password of the user.
  //usersModel.findOne is a search function of mongoose.
  //remember that we enter select:false for password part of the user model in UsersModels.js
  // so we need to use select("+password") to implement password search additional to email.
  //if we allow password to be selected then our function will be like this:
  //usersModel.findOne({email:email, password:password})
  const dbControl= await usersModel.findOne({email:email}).select("+password") 
  
  //write conditions according to existance of user data in mongoDB.
  if(!dbControl){
       //if user data(email and password) does not exist in database,
       //we will create a custom error send this to errorController function which we use as a middleware.
       return next(new CustomError("please sign up",400))
  }
  //because of have already hashed password, 
  //we need to check if the hashed password is the same with the other one coming from client request
  //bcrypt.compareSync will handle this issue.
  const isPasswordMatched=bcrypt.compareSync(password,dbControl.password);
  if(!isPasswordMatched){
    //if passwords do not match:
    //we will create a custom error and pass message of error and 400 status to this as parameters.
    //we wrap custom error with next and send this to errorController function which we use as a middleware.
    //we do not need to create a custom error, if we write next(err), err is sent to errorController anyway
    //but this error stems from the user so we should return "400 bad request" status.
    return next(new CustomError("password is not valid",400))
  }
  else{
    //if passwords match we will generate token.
    const token=generateJWT(req.body)
    //and send cookie with token to the client.
    res.status(200).cookie("access_token",token,{
      httpOnly:true,
      expires:new Date(Date.now()+(parseInt(process.env.COOKIE_EXPIRE)*1000)), //remember that process.env.COOKIE_EXPIRE is milisecond
      secure:process.env.NODE_ENV==="development" ? false : true
    }).json({
      success: true,
      access_token:token,
    });
  }
});


//when a user wants to change his/her own password, this function runs.
const changePassword= asyncErrorWrapper(async (req,res)=>{

  //at first we will get SYSTEM_VALIDATION_KEY from dot.env
  const {SYSTEM_VALIDATION_KEY}=process.env;
  //then get neccessary data from body of client request.
  const {email,validationKey,newPassword}=req.body;
  

  if(validationKey===SYSTEM_VALIDATION_KEY){

    //if validation keys match we will hash new password and update the user data in database.

    //saltRounds is about hash number in a second.
    //saltRounds 9--> 20 hashes/second.
    //saltRounds 10--> 10 hashes/second.
    //saltRounds 11--> 5 hashes/second. etc.
    //lower saltRounds is more secure.
    const saltRounds=10;

    //at first we will generate salt
    //salt is a random string that makes the hash secure.
    const salt=await bcrypt.genSalt(saltRounds);
    //then hassh new password and assign it to a variable.
    hashed_password=await bcrypt.hash(newPassword, salt);

    //then we will use findOneAndUpdate function of mongoose.
    //we will give a json object to this function as option configuration.
    //we set new:true to this json that we call as options.
    //new:true returns user data after update, while new:false before update.
    //{email:email},{password:hashed_password} means that:
    //search by email and change the password with hashed_password.
    const options={new:true};
    const updatedDBData=await usersModel.findOneAndUpdate({email:email},{password:hashed_password},options);
    //then return response to client.
    res.status(200).json({
      success:true,
      message:"your password has been changed"
    })
  }
  else{
    //if validation keys do not match return a response to client.
    res.status(200).json({
      success:false,
      message: "please check your email and validation key"
    })
  }

});


module.exports = {
  getSystemDataFromDB,
  getWeatherData,
  createUserToDB,
  logInControl,
  generateJWT,
  verifyJWT,
  changePassword
};
