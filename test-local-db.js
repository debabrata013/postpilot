// Test script for local MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

// Use a local MongoDB instance for testing
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/postpilot_test';

async function testLocalMongoDB() {
  try {
    console.log('Attempting to connect to local MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('Successfully connected to local MongoDB!');
    
    // Create a simple test schema and model
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Create a test document
    const testDoc = await Test.create({ name: 'Test Document' });
    console.log('Created test document:', testDoc);
    
    // Find the test document
    const foundDoc = await Test.findById(testDoc._id);
    console.log('Found test document:', foundDoc);
    
    // Delete the test document
    await Test.findByIdAndDelete(testDoc._id);
    console.log('Deleted test document');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return true;
  } catch (error) {
    console.error('Error testing local MongoDB:', error);
    return false;
  }
}

testLocalMongoDB();
