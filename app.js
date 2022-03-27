const express=require("express");
const dotenv=require("dotenv");
const login=require("./routers/RouterLogin");
const dashboard=require("./routers/RouterDashboard");
const signup=require("./routers/RouterSignUp");
const logout=require("./routers/RouterLogOut");
const changepassword=require("./routers/RouterChangePassword");
const prediction=require("./routers/RouterPrediction")
const verify=require("./routers/RouterVerify")
const connectDatabase=require("./database/ConnectDatabase");
const errorcontroller=require("./errors/ErrorController");
const cors = require('cors');

//in this project we will use mongoose to do handle mongoDB stuff
//and use axios to make requests.

//middleware concept:
//middlewares runs between client and server if it is defined with app.use(). here app is the name of main js file.
//this means that middleware is defined for whole application because we do not specify any route in it.
//or can be defined in a route and runs before that route.
//for example:router.get("/weather",verifyJWT,getWeatherData) in this code verifyJWT is a middleware an runs before /dashboard/weather route.
//and if verifyJWT pass the information via next parameter then getWeatherData runs.

//Environment variables
//dot.env is for hiding the variables that we do not want to show in source code.
//dot.env is unaccessable from outside.
dotenv.config(
    {
        path: "./config/config.env"
    }
)

//connecting mongo database
connectDatabase();


//rest api
//at first create an apllication via express.
const app=express();
//then assign the port number which we defined in dot.env to a variable
//at the bottom of app.js we will run express.
const PORT=process.env.PORT;

//cors middleware
//CORS is Cross Origin Resource Sharing
//cors is for directing permission client request to third party site.
//in this project we will get weather data from third party(outside) API
//so the web browser of client will accept the response from routes
//if we want to apply cors middleware for whole application, we should use app.use(cors())
//or we can define cors for a single route as a middleware for example app.get("/something",cors(),doSomeStuff).
//if we do not pass a json object(for options) to cors() function, it will allow all third party sites.
//so we need to configure cors options:
var corsOptions = {
    origin: process.env.WEATHER_API_URL,
    optionsSuccessStatus: 200
}
//and using cors
//.AllowAll is for permission of everything in response for third party API that we defined in corsOptions.
app.use(cors(corsOptions.AllowAll))


//json middleware
//thanks to method below, express recognizes the incoming Request Object as a JSON Object. 
//because of we will not specify any route, this middleware will run for whole application(all routes).
app.use(express.json());


//router middleware
//when we use a function in app.use(), it is used as a middleware and this middleware works between client and server.
//other middlewares that we write in routes runs in front of that route.
//for example:router.get("/weather",verifyJWT,getWeatherData) in this code verifyJWT is a middleware an runs before /dashboard/weather route.
//and if verifyJWT pass the information via next parameter then getWeatherData runs.
//we do not write routes directly app.js due to write clean codes.
//the code part below is the usage of express.router.
//we have written routes in modules seperately as express router and export them in order to use in app.use()
app.use("/login",login);
app.use("/dashboard",dashboard);
app.use("/signup",signup);
app.use("/logout",logout);
app.use("/changepassword",changepassword);
app.use("/prediction",prediction);
app.use("/verify",verify);


//error controller middleware
//we should use error controller at the bottom of app.js
//Because when error occurs in the logic codes should reach the error controller at last.
//when we use a function in app.use(), it is used as a middleware.
//because of using errorcontroller function as app.use(errorcontroller) without spcifying any routes,
//this function will run for all errors.
app.use(errorcontroller)


//now time to raise the app
app.listen(PORT,()=>{
    console.log("server is running on port: "+PORT)
})