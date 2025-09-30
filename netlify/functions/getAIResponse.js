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
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_AI_API_KEY environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'AI is not configured. Please contact the site owner.'
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

    // Prepare the request to Google Gemini API using latest format
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    const geminiRequestBody = {
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    };

    // Make the API call to Google Gemini using the official format
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(geminiRequestBody)
    });

    // Handle non-200 responses from Gemini API
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);

      let statusCode = 500;
      let message = 'AI service temporarily unavailable. Please try again later.';

      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        statusCode = 500;
        message = 'AI credentials are invalid or missing. Please contact the site owner.';
      } else if (geminiResponse.status === 429) {
        statusCode = 429;
        message = 'The AI service is receiving too many requests. Please wait a moment and try again.';
      }

      return {
        statusCode,
        headers,
        body: JSON.stringify({
          error: message
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

    if (geminiData.promptFeedback && geminiData.promptFeedback.blockReason) {
      console.warn('Gemini blocked prompt:', geminiData.promptFeedback);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'The AI could not answer that request. Please rephrase and try again.'
        })
      };
    }

    const primaryCandidate = Array.isArray(geminiData.candidates)
      ? geminiData.candidates.find(candidate =>
          candidate &&
          candidate.content &&
          Array.isArray(candidate.content.parts) &&
          candidate.content.parts.some(part => typeof part.text === 'string' && part.text.trim().length > 0)
        )
      : null;

    const aiReply = primaryCandidate
      ? primaryCandidate.content.parts
          .map(part => (typeof part.text === 'string' ? part.text.trim() : ''))
          .filter(Boolean)
          .join('\n')
          .trim()
      : '';

    if (!aiReply) {
      console.warn('Gemini returned no usable content:', geminiData);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'The AI did not return any content. Please try again.'
        })
      };
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