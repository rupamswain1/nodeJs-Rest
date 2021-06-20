const jwt =require('jsonwebtoken');

module.exports=(req,res,next)=>{
    const token=req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        decodedToken=jwt.verify(token,'secretkeyforuser');
    }catch(err){
        err.statusCode=500;
        throw err;
    }
    if(!decodedToken){
        const error=new Error('Not Authenticated');
        error.stausCode=401;
        throw error;
    }
    req.userId=decodedToken.userId;
    next();
}