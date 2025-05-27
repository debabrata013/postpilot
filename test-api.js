// Test script for PostPilot API endpoints
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'test-user-123';
let testChatId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to log test results
function logResult(testName, success, response = null, error = null) {
  if (success) {
    console.log(`${colors.green}✓ PASS: ${testName}${colors.reset}`);
    if (response) {
      console.log(`  Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
    }
  } else {
    console.log(`${colors.red}✗ FAIL: ${testName}${colors.reset}`);
    if (error) {
      console.log(`  Error: ${error.message}`);
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }
  console.log(''); // Empty line for readability
}

// Add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test 1: Create a new chat
async function testCreateChat() {
  try {
    console.log(`${colors.blue}TEST: Creating a new chat${colors.reset}`);
    
    const response = await axios.post(`${BASE_URL}/chat`, {
      userId: TEST_USER_ID,
      message: 'Create a Twitter post about artificial intelligence'
    });
    
    testChatId = response.data._id;
    console.log(`Chat ID for further tests: ${testChatId}`);
    
    logResult('Create Chat', true, response);
    return true;
  } catch (error) {
    logResult('Create Chat', false, null, error);
    return false;
  }
}

// Test 2: Get chat by ID
async function testGetChat() {
  if (!testChatId) {
    console.log(`${colors.yellow}SKIP: Get Chat - No chat ID available${colors.reset}`);
    return false;
  }
  
  try {
    console.log(`${colors.blue}TEST: Getting chat by ID${colors.reset}`);
    
    // Get the chat ID from the response data
    const chatId = testChatId;
    console.log(`Using chat ID: ${chatId}`);
    
    const response = await axios.get(`${BASE_URL}/chat/${chatId}`);
    
    logResult('Get Chat', true, response);
    return true;
  } catch (error) {
    logResult('Get Chat', false, null, error);
    return false;
  }
}

// Test 3: Update an existing chat
async function testUpdateChat() {
  if (!testChatId) {
    console.log(`${colors.yellow}SKIP: Update Chat - No chat ID available${colors.reset}`);
    return false;
  }
  
  try {
    console.log(`${colors.blue}TEST: Updating an existing chat${colors.reset}`);
    
    const response = await axios.put(`${BASE_URL}/chat`, {
      chatId: testChatId,
      message: 'Can you make that post more engaging?'
    });
    
    logResult('Update Chat', true, response);
    return true;
  } catch (error) {
    logResult('Update Chat', false, null, error);
    return false;
  }
}

// Test 4: Update chat title
async function testUpdateChatTitle() {
  if (!testChatId) {
    console.log(`${colors.yellow}SKIP: Update Chat Title - No chat ID available${colors.reset}`);
    return false;
  }
  
  try {
    console.log(`${colors.blue}TEST: Updating chat title${colors.reset}`);
    
    const response = await axios.patch(`${BASE_URL}/chat/${testChatId}`, {
      title: 'Twitter AI Content'
    });
    
    logResult('Update Chat Title', true, response);
    return true;
  } catch (error) {
    logResult('Update Chat Title', false, null, error);
    return false;
  }
}

// Test 5: List all chats for a user
async function testListChats() {
  try {
    console.log(`${colors.blue}TEST: Listing all chats for a user${colors.reset}`);
    
    const response = await axios.get(`${BASE_URL}/chats?userId=${TEST_USER_ID}`);
    
    logResult('List Chats', true, response);
    return true;
  } catch (error) {
    logResult('List Chats', false, null, error);
    return false;
  }
}

// Test 6: Get chat history with pagination
async function testChatHistory() {
  try {
    console.log(`${colors.blue}TEST: Getting chat history with pagination${colors.reset}`);
    
    const response = await axios.get(`${BASE_URL}/chat/history?userId=${TEST_USER_ID}&page=1&limit=5`);
    
    logResult('Chat History', true, response);
    return true;
  } catch (error) {
    logResult('Chat History', false, null, error);
    return false;
  }
}

// Test 7: Delete a chat
async function testDeleteChat() {
  if (!testChatId) {
    console.log(`${colors.yellow}SKIP: Delete Chat - No chat ID available${colors.reset}`);
    return false;
  }
  
  try {
    console.log(`${colors.blue}TEST: Deleting a chat${colors.reset}`);
    
    const response = await axios.delete(`${BASE_URL}/chat/${testChatId}`);
    
    logResult('Delete Chat', true, response);
    return true;
  } catch (error) {
    logResult('Delete Chat', false, null, error);
    return false;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log(`${colors.blue}=== STARTING API TESTS ===${colors.reset}\n`);
  
  // Create a chat first to get an ID for other tests
  const createSuccess = await testCreateChat();
  
  // Add delay between tests to ensure database operations complete
  await delay(1000);
  
  // Only continue with ID-dependent tests if we have a chat ID
  if (createSuccess) {
    await testGetChat();
    await delay(1000);
    
    await testUpdateChat();
    await delay(1000);
    
    await testUpdateChatTitle();
    await delay(1000);
  }
  
  // These tests don't depend on a specific chat ID
  await testListChats();
  await delay(1000);
  
  await testChatHistory();
  await delay(1000);
  
  // Delete the chat last
  if (createSuccess) {
    await testDeleteChat();
  }
  
  console.log(`${colors.blue}=== API TESTS COMPLETED ===${colors.reset}`);
}

// Run the tests
runAllTests();
