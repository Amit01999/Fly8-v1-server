const mongoose = require('mongoose');
const Programs = require('../models/program.js');
const programsData = require('./programs.js');

const MONGO_URL =
  'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to DB');

    // Remove the 'id' field from each program (MongoDB will auto-generate _id)
    const cleanedPrograms = programsData.map(program => {
      const { id, ...rest } = program;
      return rest;
    });

    console.log(`📊 Attempting to insert ${cleanedPrograms.length} programs...`);

    const result = await Programs.insertMany(cleanedPrograms, {
      ordered: false,
    });
    console.log(`✅ Successfully inserted ${result.length} programs.`);
  } catch (err) {
    if (err.code === 11000) {
      console.error('❌ Duplicate key error: Some programs may already exist in the database.');
      console.error('   Inserted:', err.result?.nInserted || 0, 'programs');
    } else {
      console.error('❌ Error inserting programs:', err.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

main();
