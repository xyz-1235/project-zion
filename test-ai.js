/**
 * Local test script for Project Zion AI function
 * Run with: node test-ai.js
 */

require('dotenv').config();

// Use built-in fetch in Node 18+; fallback for older Node
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Import the Netlify function (CJS assumed)
const { handler } = require('./netlify/functions/getAIResponse.js');

async function testAIFunction() {
  console.log('🚀 Testing Project Zion AI Function...\n');
  console.log('='.repeat(50));

  // Test 1: Valid message
  console.log('\n📝 Test 1: Valid message');
  const event1 = {
    httpMethod: 'POST',
    body: JSON.stringify({ message: 'Hello, I need help with cyberbullying' })
  };

  try {
    const result1 = await handler(event1, {});
    console.log(`✅ Status: ${result1.statusCode}`);
    const response1 = JSON.parse(result1.body);
    console.log(`💬 Response: ${response1.reply || response1.error}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));

  // Test 2: Empty message
  console.log('\n📝 Test 2: Empty message');
  const event2 = {
    httpMethod: 'POST',
    body: JSON.stringify({ message: '' })
  };

  try {
    const result2 = await handler(event2, {});
    console.log(`✅ Status: ${result2.statusCode}`);
    const response2 = JSON.parse(result2.body);
    console.log(`💬 Response: ${response2.reply || response2.error}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));

  // Test 3: Missing API key
  console.log('\n📝 Test 3: Missing API key');
  const originalKey = process.env.COHERE_API_KEY;
  delete process.env.COHERE_API_KEY;

  const event3 = {
    httpMethod: 'POST',
    body: JSON.stringify({ message: 'Test message' })
  };

  try {
    const result3 = await handler(event3, {});
    console.log(`✅ Status: ${result3.statusCode}`);
    const response3 = JSON.parse(result3.body);
    console.log(`💬 Response: ${response3.reply || response3.error}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Restore API key
  if (originalKey) process.env.COHERE_API_KEY = originalKey;

  console.log('\n' + '='.repeat(50));

  // Test 4: OPTIONS request
  console.log('\n📝 Test 4: OPTIONS request (CORS preflight)');
  const event4 = {
    httpMethod: 'OPTIONS'
  };

  try {
    const result4 = await handler(event4, {});
    console.log(`✅ Status: ${result4.statusCode}`);
    console.log(`🔧 CORS Headers: ${JSON.stringify(result4.headers, null, 2)}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ AI Function tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('- Valid message: Should return 200 with AI response');
  console.log('- Empty message: Should return 400 with error');
  console.log('- Missing API key: Should return 500 with configuration error');
  console.log('- OPTIONS request: Should return 200 with CORS headers');
  console.log('\n🔧 To test with real Cohere API, set COHERE_API_KEY in .env file');
}

// Check if API key is set
if (process.env.COHERE_API_KEY) {
  console.log('🔑 API key found in environment');
} else {
  console.log('⚠️  No API key found - using mock responses');
  console.log('💡 Create .env file with COHERE_API_KEY=your_key_here for real testing');
}

testAIFunction().catch(console.error);
