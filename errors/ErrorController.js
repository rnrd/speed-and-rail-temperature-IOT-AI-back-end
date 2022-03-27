const CustomError=require("./CustomError")

//we have constructed our custom error class.(pls see CustomError.js)
//we will specify some errors that we want to show to users.
//for other erorr we will define server error and give status 500.
const errorController=(err,req,res,next)=>{
    //at first we will define a variable that will hold the err variable coming with callback if needed.
    let customError;
    //Now let's set the error conditions of our server.
    if(err.name==="SyntaxError"){
        customError=new CustomError(err.message,400)
        console.log(customError.message);
        console.log(customError.status);
        console.log(customError.name);
        console.log(customError.stack)
        return res.status(customError.status).json({
            success:false,
            message:customError.message,
        })
    }
    else if(err.name==="ValidationError"){
        customError=new CustomError(err.message,400);
        return res.status(customError.status).json({
            success:false,
            message:customError.message
        })  
    }

    else if(err.name==="TypeError"){
        customError=new CustomError(err.message,400);
        return res.status(customError.status).json({
            success:false,
            message:customError.message
        })  
    }

    else if(err.status===400){

        return res.status(err.status).json({
            success:false,
            message:err.message
        })  
    }
    
    else{
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
    })
    }
}

module.exports=errorController;