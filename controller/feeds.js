const { validationResult }=require('express-validator');
const Post=require('../models/posts');
const path=require('path')
const fs=require('fs');

let totalItems;
exports.getPosts=(req,res,next)=>{
    let currentPage=req.query.page||1;
    let perPage=2;
    Post.find()
    .countDocuments()
    .then(count=>{
        totalItems=count;
        return Post.find()
        .skip((currentPage-1)*perPage).limit(perPage)
    })
    .then(posts=>{
        res.status(200)
        .json({posts:posts,message:'fetched successfully',totalItems:totalItems})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })

};

exports.createPosts=(req,res,next)=>{
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
        creator:{name:'Rupam'},
        imageUrl:imageUrl,
    })
    post.save()
    .then(postReturned=>{
        res.status(200).json({
            message:"Post created successfully",
            post:postReturned
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
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
    
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error=new Error('could not fid post');
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

            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(post=>{
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