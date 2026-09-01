const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB      = require('./src/config/db');
const donationRoutes = require('./src/routes/donationRoutes');
const errorHandler   = require('./src/middleware/errorHandler');

dotenv.config();

//Connect to MONGODB
connectDB();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//API Routes
app.use("/api/donations", donationRoutes);

//Health Check Route
app.get("/",(req,res)=>{
    res.json({message: "Donation Management API is running"});
});

//Global Error Handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});