require('dotenv').config();

async function quickTest() {
  const { handler } = require('./netlify/functions/getAIResponse.js');
  
  console.log('🚀 Quick AI test...');
  
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ message: 'Hello' })
  };

  try {
    const result = await handler(event, {});
    console.log('Status:', result.statusCode);
    console.log('Response:', JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
  }
}

quickTest();