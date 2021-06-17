exports.getPosts=(req,res,next)=>{
    res.json({
        posts:[{
            title:'first post',
            content:'this is the first post'
        }]
    })
};

exports.createPosts=(req,res,next)=>{
    const title=req.body.title;
    const content=req.body.title;

    res.status(201).json({
        message:"Post created successfully",
        post:{
            id:new Date().toISOString,
            title:title,
            content:content,
        } 
    })
};