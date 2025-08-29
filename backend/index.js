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
app.use(cors({
  origin: ["http://localhost:3000",'*',"https://www.loklink.in"], // allow all domains
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // allow all HTTP methods
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // allow common headers
}));


app.use('/api',router);

 connectDB();
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});