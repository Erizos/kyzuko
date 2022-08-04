const mongoose = require("mongoose");

const connectDB = async (client) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối tới cơ sở dữ liệu!");
  } catch (e) {
    console.log(e);
  }
};

module.exports = connectDB;
