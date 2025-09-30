/**
 * Netlify Serverless Function for Project Zion AI Integration
 * Securely handles communication with Cohere API
 */

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      console.error('Missing COHERE_API_KEY environment variable');
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

    // Prepare system prompt for cybersecurity support
    const systemPrompt = `You are an AI assistant for Project Zion, a digital sanctuary providing support for cybercrime victims. Your role is to:

1. Provide empathetic, non-judgmental support for people facing cyberbullying, online scams, privacy violations, and digital harassment
2. Offer practical, actionable cybersecurity advice and safety tips
3. Guide users toward appropriate resources and reporting mechanisms
4. Maintain user privacy and anonymity at all times
5. Be compassionate while providing clear, helpful guidance

Remember: You're helping people who may be vulnerable, scared, or traumatized. Be gentle, supportive, and focus on practical solutions they can implement to protect themselves.`;

    // Prepare the request to Cohere API
    const cohereUrl = 'https://api.cohere.ai/v1/chat';
    
    const cohereRequestBody = {
      model: 'command-r-plus-08-2024',
      message: userMessage,
      preamble: systemPrompt,
      temperature: 0.7,
      max_tokens: 1000,
      safety_mode: 'CONTEXTUAL'
    };

    // Make the API call to Cohere
    const cohereResponse = await fetch(cohereUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(cohereRequestBody)
    });

    // Handle non-200 responses from Cohere API
    if (!cohereResponse.ok) {
      const errorText = await cohereResponse.text();
      console.error(`Cohere API error: ${cohereResponse.status} - ${errorText}`);

      let statusCode = 500;
      let message = 'AI service temporarily unavailable. Please try again later.';

      if (cohereResponse.status === 401 || cohereResponse.status === 403) {
        statusCode = 500;
        message = 'AI credentials are invalid or missing. Please contact the site owner.';
      } else if (cohereResponse.status === 429) {
        statusCode = 429;
        message = 'The AI service is receiving too many requests. Please wait a moment and try again.';
      } else if (cohereResponse.status === 400) {
        statusCode = 400;
        message = 'Invalid request. Please try rephrasing your message.';
      }

      return {
        statusCode,
        headers,
        body: JSON.stringify({
          error: message
        })
      };
    }

    // Parse the response from Cohere
    let cohereData;
    try {
      cohereData = await cohereResponse.json();
    } catch (parseError) {
      console.error('Failed to parse Cohere response:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Invalid response from AI service. Please try again.'
        })
      };
    }

    // Extract the AI's reply from the response
    let aiReply = '';
    
    if (cohereData.text && typeof cohereData.text === 'string') {
      aiReply = cohereData.text.trim();
    } else if (cohereData.message && typeof cohereData.message === 'string') {
      aiReply = cohereData.message.trim();
    }

    if (!aiReply) {
      console.warn('Cohere returned no usable content:', cohereData);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'The AI did not return any content. Please try again.'
        })
      };
    }

    // Check if the response was filtered for safety
    if (cohereData.is_search_required === false && cohereData.safety_mode === 'STRICT') {
      console.warn('Cohere filtered response for safety:', cohereData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'The AI could not answer that request. Please rephrase and try again.'
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