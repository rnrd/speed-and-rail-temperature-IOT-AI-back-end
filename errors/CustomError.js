
//we will construct our custom error class inheriting from node.js raw error class.
//Later we will write an error controller function to control errors of server.
//We will use this class in that function.
class CustomError extends Error{

    //The constructor of the class will take two parameters: message and status.
    constructor(message,status){
        super(message);
        this.status=status;
        
    }
}

module.exports=CustomError;