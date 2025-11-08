const mongoose = require('mongoose');
const universities = require('../models/universities.js');
const universitiesData = require('./universities.js');

const MONGO_URL =
  'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to DB');

    // Insert one new document
    const result = await universities.create(universitiesData);
    console.log('✅ Data inserted:', result);
  } catch (err) {
    console.error('❌ Error inserting document:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

main();
