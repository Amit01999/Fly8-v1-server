const mongoose = require('mongoose');
const Programs = require('../models/program.js');

const MONGO_URL =
  'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to DB\n');

    // Get total count
    const totalCount = await Programs.countDocuments();
    console.log(`📊 Total Programs in Database: ${totalCount}\n`);

    // Get programs by country
    const byCountry = await Programs.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    console.log('🌍 Top 10 Countries by Program Count:');
    byCountry.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item._id}: ${item.count} programs`);
    });

    // Get programs by level
    const byLevel = await Programs.aggregate([
      {
        $group: {
          _id: '$programLevel',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log('\n🎓 Programs by Level:');
    byLevel.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item._id}: ${item.count} programs`);
    });

    // Get top universities
    const byUniversity = await Programs.aggregate([
      {
        $group: {
          _id: '$universityName',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    console.log('\n🏛️  Top 10 Universities by Program Count:');
    byUniversity.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item._id}: ${item.count} programs`);
    });

    // Sample programs
    const samples = await Programs.find().limit(3);
    console.log('\n📋 Sample Programs:');
    samples.forEach((program, index) => {
      console.log(`\n   ${index + 1}. ${program.programName}`);
      console.log(`      University: ${program.universityName}`);
      console.log(`      Country: ${program.country}`);
      console.log(`      Level: ${program.programLevel}`);
      console.log(`      Duration: ${program.duration}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

main();
