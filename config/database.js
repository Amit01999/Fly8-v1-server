require('dotenv').config();
const mongoose = require('mongoose');

exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.log('DB Connection Failed');
    console.error(err.message);
    process.exit(1);
  }
};
