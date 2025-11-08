const mongoose = require('mongoose');
const University = require('../models/universities.js');
const universitiesData = require('./universities.js');

const MONGO_URL =
  'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to DB\n');

    // Validate and clean data
    console.log('🔍 Validating data...');
    const validUniversities = [];
    const invalidUniversities = [];
    const seenCodes = new Set();
    const duplicates = [];

    universitiesData.forEach((uni, index) => {
      // Check required fields
      if (!uni.universitycode || !uni.universityName || !uni.country) {
        invalidUniversities.push({
          index,
          code: uni.universitycode || 'MISSING',
          name: uni.universityName || 'MISSING',
          country: uni.country || 'MISSING'
        });
        return;
      }

      // Check for duplicates
      if (seenCodes.has(uni.universitycode)) {
        duplicates.push({
          code: uni.universitycode,
          name: uni.universityName
        });
        return; // Skip duplicate
      }

      seenCodes.add(uni.universitycode);
      validUniversities.push(uni);
    });

    console.log(`   Total records: ${universitiesData.length}`);
    console.log(`   ✅ Valid: ${validUniversities.length}`);
    console.log(`   ❌ Invalid (missing required fields): ${invalidUniversities.length}`);
    console.log(`   🔄 Duplicates skipped: ${duplicates.length}\n`);

    // Show invalid universities
    if (invalidUniversities.length > 0) {
      console.log('⚠️  Invalid universities (will be skipped):');
      invalidUniversities.forEach(uni => {
        console.log(`   - ${uni.name} (code: ${uni.code}, country: ${uni.country})`);
      });
      console.log('');
    }

    // Show duplicates
    if (duplicates.length > 0) {
      console.log('⚠️  Duplicate universities (will be skipped):');
      duplicates.forEach(uni => {
        console.log(`   - ${uni.name} (code: ${uni.code})`);
      });
      console.log('');
    }

    if (validUniversities.length === 0) {
      console.log('❌ No valid universities to insert!');
      return;
    }

    // Delete all existing universities (optional - comment out if you want to keep existing data)
    const deleteResult = await University.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing universities\n`);

    // Insert valid universities
    console.log('📤 Inserting universities...');
    const result = await University.insertMany(validUniversities, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} universities\n`);

    // Show sample of inserted data
    console.log('📊 Sample of inserted universities:');
    result.slice(0, 5).forEach((uni, index) => {
      console.log(`   ${index + 1}. ${uni.universityName} (${uni.country})`);
    });

    // Show statistics by country
    const countryStats = {};
    result.forEach(uni => {
      countryStats[uni.country] = (countryStats[uni.country] || 0) + 1;
    });

    console.log(`\n🌍 Universities by country:`);
    Object.entries(countryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`   ${country}: ${count}`);
      });

    console.log(`\n✨ Total universities in database: ${result.length}`);
  } catch (err) {
    console.error('\n❌ Error inserting universities:', err.message);
    if (err.code === 11000) {
      console.error('   Duplicate universitycode found in database.');
      // Try to insert one by one to see which ones succeed
      console.log('\n🔄 Attempting individual inserts...');
      let successCount = 0;
      let failCount = 0;

      for (const uni of validUniversities) {
        try {
          await University.create(uni);
          successCount++;
        } catch (e) {
          failCount++;
          if (e.code !== 11000) {
            console.log(`   ❌ Failed: ${uni.universityName} - ${e.message}`);
          }
        }
      }

      console.log(`\n✅ Successfully inserted: ${successCount}`);
      console.log(`❌ Failed (duplicates): ${failCount}`);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

main();
