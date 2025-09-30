/**
 * Netlify Serverless Function for Project Zion AI Integration
 * Securely handles communication with Google Gemini API
 */

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed. Please use POST.'
      })
    };
  }

  try {
    // Use the provided API key
    const apiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAM1vn_fYcAeFSDdyV1SXyZShzfnR_RlS8';
    if (!apiKey) {
      console.error('Missing GOOGLE_AI_API_KEY');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server configuration error. Please contact support.'
        })
      };
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid JSON in request body.'
        })
      };
    }

    // Validate message property
    if (!requestBody.message || typeof requestBody.message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing or invalid message property. Please provide a string message.'
        })
      };
    }

    const userMessage = requestBody.message.trim();
    if (userMessage.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Message cannot be empty.'
        })
      };
    }

    // Prepare the request to Google Gemini API
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent';
    
    const geminiRequestBody = {
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    };

    // Make the API call to Google Gemini
    const geminiResponse = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequestBody)
    });

    // Handle non-200 responses from Gemini API
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      
      // Return user-friendly error message
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'AI service temporarily unavailable. Please try again later.'
        })
      };
    }

    // Parse the response from Gemini
    let geminiData;
    try {
      geminiData = await geminiResponse.json();
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Invalid response from AI service. Please try again.'
        })
      };
    }

    // Extract the AI's reply from the response
    let aiReply = 'Sorry, I could not generate a response. Please try again.';
    
    if (geminiData.candidates && 
        geminiData.candidates.length > 0 && 
        geminiData.candidates[0].content && 
        geminiData.candidates[0].content.parts && 
        geminiData.candidates[0].content.parts.length > 0) {
      
      aiReply = geminiData.candidates[0].content.parts[0].text;
    }

    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply
      })
    };

  } catch (error) {
    // Log the error for debugging (server-side only)
    console.error('Unexpected error in getAIResponse function:', error);
    
    // Return generic error message to client
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'An unexpected error occurred. Please try again later.'
      })
    };
  }
};