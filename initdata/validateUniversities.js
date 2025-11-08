const universitiesData = require('./universities.js');

console.log('🔍 Validating university data...\n');

const issues = [];
let validCount = 0;

universitiesData.forEach((uni, index) => {
  const problems = [];

  // Check required fields
  if (!uni.universitycode) {
    problems.push('Missing universitycode');
  }
  if (!uni.universityName) {
    problems.push('Missing universityName');
  }
  if (!uni.country) {
    problems.push('Missing country');
  }

  if (problems.length > 0) {
    issues.push({
      index: index,
      universitycode: uni.universitycode || 'MISSING',
      universityName: uni.universityName || 'MISSING',
      country: uni.country || 'MISSING',
      problems: problems
    });
  } else {
    validCount++;
  }
});

console.log(`✅ Valid universities: ${validCount}`);
console.log(`❌ Invalid universities: ${issues.length}`);
console.log(`📊 Total universities: ${universitiesData.length}\n`);

if (issues.length > 0) {
  console.log('🔴 PROBLEMATIC UNIVERSITIES:\n');
  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. Index ${issue.index}:`);
    console.log(`   Code: ${issue.universitycode}`);
    console.log(`   Name: ${issue.universityName}`);
    console.log(`   Country: ${issue.country}`);
    console.log(`   Problems: ${issue.problems.join(', ')}`);
    console.log('');
  });

  console.log('\n⚠️  Fix these issues before uploading to database!');
} else {
  console.log('✅ All universities are valid! Ready to upload.');
}

// Check for duplicates
const codes = universitiesData.map(u => u.universitycode).filter(Boolean);
const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);

if (duplicateCodes.length > 0) {
  console.log('\n⚠️  DUPLICATE UNIVERSITY CODES FOUND:');
  const uniqueDuplicates = [...new Set(duplicateCodes)];
  uniqueDuplicates.forEach(code => {
    console.log(`   - ${code}`);
  });
}
