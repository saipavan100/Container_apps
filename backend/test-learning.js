const axios = require('axios');

// Test the learning endpoint
async function testLearningEndpoint() {
  try {
    console.log('🧪 Testing Learning Materials Endpoint...\n');
    
    // Create a test token (normally you'd need a real token, but let's try without auth first)
    const response = await axios.get('http://localhost:8080/api/learning/materials', {
      headers: {
        'Authorization': 'Bearer test_token'  // Dummy token for testing
      }
    }).catch(err => {
      if (err.response?.status === 401) {
        console.log('⚠️ Auth required. Testing without auth token...');
        return axios.get('http://localhost:8080/api/learning/materials');
      }
      throw err;
    });

    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('\nData:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLearningEndpoint();
