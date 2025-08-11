// Test the actual API endpoints
const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testAPIs() {
  try {
    console.log('Testing API endpoints...');
    
    const testUserId = 'test-firebase-user-' + Date.now();
    const testEmail = 'test@example.com';
    
    // Test user seeding
    console.log('\n1. Testing user seed...');
    const seedResult = await makeRequest('/api/users/seed', {
      user_id: testUserId,
      email: testEmail
    });
    console.log('Seed result:', seedResult);
    
    // Test saving a typing result
    console.log('\n2. Testing typing result save...');
    const testResult = await makeRequest('/api/tests', {
      user_id: testUserId,
      user_email: testEmail,
      wpm: 85,
      raw_wpm: 90,
      accuracy: 96.5,
      consistency: 88.2,
      characters: 425,
      errors: 15,
      duration: 60,
      test_type: 'standard',
      test_mode: 'time',
      time_seconds: 60,
      text_content: 'The quick brown fox jumps...'
    });
    console.log('Test result save:', testResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPIs();
