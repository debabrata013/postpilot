// Debug script to check chat ID extraction from API response
const axios = require('axios');

async function debugChatIdExtraction() {
  try {
    console.log('Creating a new chat to debug ID extraction...');
    
    const response = await axios.post('http://localhost:3000/api/chat', {
      userId: 'test-user-123',
      message: 'Debug chat ID extraction'
    });
    
    console.log('\nFull response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\nExtracted _id:');
    console.log(response.data._id);
    
    // Try different extraction methods
    console.log('\nTrying different extraction methods:');
    
    // Method 1: Direct access
    const id1 = response.data._id;
    console.log('Method 1 (direct access):', id1);
    
    // Method 2: Using JSON.stringify and regex
    const jsonStr = JSON.stringify(response.data);
    const regex = /"_id":"([^"]+)"/;
    const match = jsonStr.match(regex);
    const id2 = match ? match[1] : null;
    console.log('Method 2 (JSON.stringify + regex):', id2);
    
    // Method 3: Using grep-like approach (simulated)
    const id3 = jsonStr.includes('"_id":"') ? 
      jsonStr.split('"_id":"')[1].split('"')[0] : null;
    console.log('Method 3 (split approach):', id3);
    
    console.log('\nVerifying extracted ID:');
    if (id1) {
      try {
        const getResponse = await axios.get(`http://localhost:3000/api/chat/${id1}`);
        console.log('GET request with ID successful:', getResponse.status);
      } catch (error) {
        console.log('GET request with ID failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

debugChatIdExtraction();
