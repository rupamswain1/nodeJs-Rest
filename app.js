const express=require('express');
const bodyParser=require('body-parser');
const feedRoutes=require('./routes/feed');

const app=express();

app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.setHeader('Access-Controll-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
})

app.use('/feeds',feedRoutes)

app.listen(8000);