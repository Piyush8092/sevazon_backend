require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./route/rout');
const connectDB = require('./DB/connection');
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Increase payload size limit
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: [
    "https://www.loklink.in",
    "https://loklink-adminportal.vercel.app", 
    "http://localhost:3000",
    "http://localhost:3001", // Add this if needed
    "https://localhost:3000"
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control"
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
}));

// Add this line to handle preflight requests
app.options('*', cors());

app.use('/api', router);

connectDB();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
