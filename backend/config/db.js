const mongoose = require("mongoose");
const colors = require("colors");
require('dotenv').config();

const connectDB = async () => {
  try {
    // console.log("Connect", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI,{
      useUnifiedTopology:true,
      useNewUrlParser: true,
      useCreateIndex: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); 
  }
};

module.exports = connectDB;

