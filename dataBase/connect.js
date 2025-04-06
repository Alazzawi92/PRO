const mongoose = require("mongoose");
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URI + process.env.DB_NAME, { 
    });
    ;
    console.log("Database ok !!!!!");
  } catch (err) {
    console.log(err);
  }
}
module.exports = connectDB;
