const express=require("express");
const systemParameters = require("../database/SystemParameters");
const router=express.Router();
const {verifyJWT}=require("../helpers/HelperFunctions")
//we will define a child process and run python file for machine learning in this child process.
const spawn=require("child_process").spawn;
//const {PythonShell} = require('python-shell')

//we will define /prediction/ route and we will apply verifyJWT as the middleware of this route.
router.post("/",verifyJWT, async (req,res)=>{
    //we will establish neccessary data from body of client request
    const data = await systemParameters.find();
    data.push(req.body)
    const pydata=JSON.stringify(data);
    //we have already defined the path of python interpreter in dot.env.
    //now we will assign this to a variable.
    const pythonExecutable = process.env.PYTHON_PATH;
    //then execute the child process
    const pyProcess = spawn(pythonExecutable, ["./prediction/PythonPrediction.py"]);
    //and listening to child process in order to catch the return data.
    pyProcess.stdout.on("data", (datapy) => {
      //console.log(datapy.toString());
      res.status(200).json({
          success:true,
          message:datapy.toString()
      })
    });
    pyProcess.stdin.write(pydata);
    pyProcess.stdin.end();
    
})

module.exports=router;