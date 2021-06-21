const express=require('express');
const bodyParser=require('body-parser');
const feedRoutes=require('./routes/feed');
const authRoutes=require('./routes/auth')
const cors=require('cors')
const path=require('path');
const mongoose=require('mongoose');
const multer=require('multer');
const { Result } = require('express-validator');
const app=express();


const fileStorage = multer.diskStorage({
    destination: './images/',
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      );
    },
  });
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};

app.use(bodyParser.json());
app.use(cors())
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
})
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));
app.use('/images',express.static(path.join(__dirname,'images')));



app.use('/feeds',feedRoutes);
app.use('/auth',authRoutes);
app.use((error,req,res,next)=>{
    console.log(error);
    const status=error.statusCode || 500;
    const message=error.message;
    const data=error.data;
    res.status(status).json({message:message,data:data});
})

mongoose.connect('mongodb+srv://rupam123:rupam123@nodecluster.plaky.mongodb.net/NodeRest?retryWrites=true&w=majority')
.then(result=>{
    console.log('<<<<<<<<<<<<server is up and Running>>>>>>>>>>>>>>>>>>>>>>>>')
    const server=app.listen(8000);
    const io=require('./socket').init(server);
    io.on('connection',socket=>{
        console.log('client connected')
    })
})
.catch(err=>console.log(err)) 