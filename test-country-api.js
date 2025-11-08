const axios = require('axios');

// Test the universities by country endpoint
async function testCountryAPI() {
  const baseURL = 'http://localhost:4000/api/v1';

  const testCountries = [
    'Australia',
    'australia',
    'USA',
    'United States',
    'UK',
    'United Kingdom',
    'New Zealand',
    'newzealand',
    'Canada',
    'canada',
    'Spain',
    'spain'
  ];

  console.log('🧪 Testing Universities by Country API\n');

  for (const country of testCountries) {
    try {
      const encodedCountry = encodeURIComponent(country);
      const url = `${baseURL}/universities/country/${encodedCountry}`;

      console.log(`Testing: "${country}"`);
      console.log(`URL: ${url}`);

      const response = await axios.get(url);

      if (response.data.success) {
        console.log(`✅ Success! Found ${response.data.count} universities`);
        if (response.data.count > 0) {
          console.log(`   First university: ${response.data.data[0].universityName}`);
        }
      } else {
        console.log(`❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`   Details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }
}

testCountryAPI();
