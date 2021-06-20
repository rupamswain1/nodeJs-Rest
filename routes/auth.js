const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const User=require('../models/user');
const authContoller=require('../controller/auth')

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please Enter a valid email')
    .custom((value,{req})=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('E-mail address already exist');
            }
        });
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name')
    .trim()
    .not()
    .isEmpty()
],
authContoller.signup);

router.post('/login',authContoller.login);

module.exports = router;