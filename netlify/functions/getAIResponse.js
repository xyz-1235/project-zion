// Project Zion - Netlify Serverless Function for AI Chat
// This runs securely on Netlify's servers, protecting your API key
// Version: 2.2 - Fixed API endpoints for supported models

const FUNCTION_VERSION = "2.2";

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        // Parse the request body
        const { messages, systemPrompt } = JSON.parse(event.body);

        const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
        
        if (!GOOGLE_AI_API_KEY) {
            throw new Error('API key not configured in environment variables');
        }

        // Try multiple working endpoints in order of preference
        const API_ENDPOINTS = [
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
        ];

        // Build conversation context for Gemini
        let conversationText = systemPrompt + "\n\n";
        
        // Add conversation history
        messages.forEach(msg => {
            if (msg.role === "user") {
                conversationText += `User: ${msg.content}\n\n`;
            } else if (msg.role === "assistant") {
                conversationText += `Assistant: ${msg.content}\n\n`;
            }
        });
        
        conversationText += "Assistant: ";

        // Try each endpoint until one works
        let lastError = null;
        
        for (let i = 0; i < API_ENDPOINTS.length; i++) {
            const API_URL = API_ENDPOINTS[i];
            
            try {
                console.log(`Attempting API call with: ${API_URL}`);
                
                const response = await fetch(`${API_URL}?key=${GOOGLE_AI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ 
                                text: conversationText 
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 1000,
                            temperature: 0.7
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const aiMessage = data.candidates[0].content.parts[0].text;
                        const modelName = API_URL.split('/models/')[1].split(':')[0];
                        
                        console.log(`Success with model: ${modelName}`);
                        
                        return {
                            statusCode: 200,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                message: aiMessage,
                                success: true,
                                model: modelName,
                                version: FUNCTION_VERSION,
                                endpoint: API_URL
                            })
                        };
                    }
                }
                
                // If we get here, the response wasn't ok or didn't have the expected format
                const errorData = await response.json();
                lastError = new Error(`${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                console.log(`Failed with ${API_URL}: ${lastError.message}`);
                
            } catch (error) {
                lastError = error;
                console.log(`Error with ${API_URL}:`, error.message);
            }
        }
        
        // If we get here, all endpoints failed
        throw lastError || new Error('All Google AI API endpoints failed');

    } catch (error) {
        console.error("Error in AI serverless function:", error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: error.message || "Failed to get response from AI service",
                success: false,
                version: FUNCTION_VERSION
            })
        };
    }
};