require('dotenv').config();

async function testCohere() {
  const { handler } = require('./netlify/functions/getAIResponse.js');
  
  console.log('🚀 Testing Cohere AI integration...');
  
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ message: 'Hello, I need help with cybersecurity' })
  };

  try {
    const result = await handler(event, {});
    console.log('✅ Status:', result.statusCode);
    const response = JSON.parse(result.body);
    console.log('💬 Response:', response.reply || response.error);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCohere();