const mongoose=require('mongoose');
const schema=mongoose.Schema;

const userSchema=new schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:'new'
    },

    posts:[
    {
        type:schema.Types.ObjectID,
        ref:'Post'
    }]
});

module.exports = mongoose.model('User',userSchema);