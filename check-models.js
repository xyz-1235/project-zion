/**
 * Check available Gemini models
 */

require('dotenv').config();

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

async function listAvailableModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  console.log('🔍 Checking available Gemini models...\n');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Available models:');
    data.models.forEach(model => {
      if (model.name.includes('gemini') && model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`  📋 ${model.name}`);
        console.log(`      Display: ${model.displayName}`);
        console.log(`      Methods: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableModels();