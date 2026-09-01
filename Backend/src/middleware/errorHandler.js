//Handle CastError (invalid object id)

const handleCastError = (err) => {
    const message = `Invalid ID format: ${err.value}`;
    return{statusCode: 400, message};
};

//Handle Duplicate Errors

const handleDuplicateError = (err)=>{
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const fieldLabel = field === 'email' ? 'Email address' : field === 'phone' ? 'Phone number' : field;
    const message = `${fieldLabel} "${value}" is already associated with another donor.`;
    return {statusCode: 400, message};
};

//Handle Mongoose Validation Errors

const handleValidationError = (err)=>{
    const message = Object.values(err.errors).map((e)=> e.message).join(",");
    return {statusCode: 400, message};
};

//Main Error Handler

const errorHandler = (err,req,res,next)=>{
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if(err.name === "CastError"){
        const error = handleCastError(err);
        statusCode = error.statusCode;
        message = error.message;
    }

    if(err.code === 11000){
        const error = handleDuplicateError(err);
        statusCode = error.statusCode;
        message = error.message
    }

    if(err.name === "ValidationError"){
        const error = handleValidationError(err);
        statusCode = error.statusCode;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,

        //Show stack trace only in development 
        stack: process.env.NODE_ENV === "development"?err.stack:undefined,
    });
};

module.exports = errorHandler;