// const mongoose = require('mongoose');
// const initData = require('./data.js');

// const Country = require('../models/Country.js');

// const MONGO_URL =
//   'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

// async function main() {
//   await mongoose.connect(MONGO_URL);
//   console.log('Connected to DB letsss go');
//   console.log(initData[0]);

//   await Country.deleteMany({}); // Optional: clear existing data
//   await Country.insertMany(initData.data);
//   console.log('Data initialized');

//   mongoose.connection.close(); // Close connection after seeding
// }

// main().catch(err => console.error(err));
