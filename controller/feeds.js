const { validationResult }=require('express-validator');
const Post=require('../models/posts');
const path=require('path')
const fs=require('fs');
const User=require('../models/user');
const io=require('../socket');
let totalItems;
exports.getPosts=async (req,res,next)=>{
    let currentPage=req.query.page||1;
    let perPage=4;
    try{
    const totalItems=await Post.find().countDocuments();
    const posts=await Post.find().populate('creator').sort({createdAt:-1})
        .skip((currentPage-1)*perPage).limit(perPage); 
    
    res.status(200)
        .json({posts:posts,message:'fetched successfully',totalItems:totalItems})
    }catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }

};

exports.createPosts=async (req,res,next)=>{
    let creator;
    const title=req.body.title;
    const content=req.body.title;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        const error=new Error('Validation failed, entered data is incorrect');
        error.statusCode=422;
        throw error;
        //return res.status(422).json({message:'Validation failed data is incorrect',errors:errors})
    }
    if(!req.file){
        const error=new Error('No Image provided');
        error.statusCode=422;
        throw error;
    }
    const imageUrl=req.file.path;
    const post=new Post({
        title:title,
        content:content,
        creator:req.userId,
        imageUrl:imageUrl,

    })
    try{
    const result=await post.save();
    const user= await User.findById(req.userId);
    user.posts.push(post);
    const savedUser=await user.save();
    io.getIO().emit('post',{action:'create',post:post});
            res.status(201).json({
            message:"Post created successfully",
            post:post,
            creator:{_id:user._id,name:user.name}
            })
    
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
};

exports.getPost=(req,res,next)=>{
    const postId=req.params.postId;
    console.log(postId);
    
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error=new Error('Post Not Found');
            error.statusCode=422;
            throw error
        }
        res.status(200)
            .json({
                message:'post fetched',
                post:post,
            })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

exports.updatePost=(req,res,next)=>{
    const postId=req.params.postId;
    const title=req.body.title;
    const content=req.body.content;
    let imageUrl=req.body.image;
    console.log(imageUrl);
    if(req.file){
        imageUrl=req.file.path;
        console.log(imageUrl);
    }
    if(!imageUrl){
        const error=new Error('No File picked');
        error.statusCode=422;
        throw error;
    }
    
    Post.findById(postId).populate('creator')
    .then(post=>{
        if(!post){
            const error=new Error('could not fid post');
            error.statusCode=404;
            throw error;
        }
        if(!(post.creator._id.toString()===req.userId)){
            console.log('post==='+post)
            console.log(req.userId)
            const error=new Error('could not update post');
            error.statusCode=404;
            throw error;
        }
        if(imageUrl!=post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title=title;
        post.imageUrl=imageUrl;
        post.content=content;
        return post.save();

    })
    .then(result=>{
        console.log(result)
        console.log('IO will emit')
        io.getIO().emit('post',{action:'update',post:result})
        res.status(200).json({message:'post updated',post:result} );
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}
exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post.findById(postId)
        .then(post=>{
            if(!post){
                const error=new Error('could not find post');
                error.statusCode=404;
                throw error;
            }
            if(!(post.creator.toString()===req.userId)){
                console.log('post==='+post)
                console.log(req.userId)
                const error=new Error('could not update post');
                error.statusCode=404;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(resultt=>{
            return User.findById(req.userId)
        })
        .then(user=>{
            user.posts.pull(postId);
            return user.save();
        })
        .then(afterSave=>{
            io.getIO().emit('post',{action:'delete',post:postId});
                res.status(200).json({message:'Deleted Post'})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err);
        })
}
const clearImage=filePath=>{
    filePath=path.join(__dirname,'..',filePath);
    fs.unlink(filePath,err=>console.log(err));
}