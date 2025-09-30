require('dotenv').config();

async function checkCohereModels() {
  const apiKey = process.env.COHERE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No Cohere API key found');
    return;
  }

  console.log('🔍 Checking available Cohere models...\n');

  try {
    const response = await fetch('https://api.cohere.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Available models:');
    data.models.forEach(model => {
      console.log(`  📋 ${model.name}`);
      if (model.endpoints) {
        console.log(`      Endpoints: ${model.endpoints.join(', ')}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCohereModels();