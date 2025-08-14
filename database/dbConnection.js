const mongoose = require('mongoose');

require('dotenv').config();
const dbstring = process.env.DBSTRING;

const connectDB = async () => {
    try{
        console.log("Connecting to database...");
        await mongoose.connect(dbstring, {})
        console.log("Connected to database successfully!");
    }catch(err){
        console.error("Error connecting to database:", err);
    }
};

module.exports = connectDB;