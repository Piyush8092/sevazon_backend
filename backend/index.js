require('dotenv').config();
const express=require('express');
const app=express();
const router=require('./route/rout');
const connectDB=require('./DB/connection');
const port=process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());

app.use('/api',router);

 connectDB();
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});