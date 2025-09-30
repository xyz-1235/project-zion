// Project Zion - Netlify Serverless Function for AI Chat
// This runs securely on Netlify's servers, protecting your API key

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

        // Get the API key from environment variables
        const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
        
        if (!GOOGLE_AI_API_KEY) {
            throw new Error('API key not configured in environment variables');
        }

        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

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

        // Call Google AI Studio API with updated format
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
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 10
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH", 
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google AI API Error:', response.status, errorData);
            
            // If the model is not found, try with a fallback model
            if (response.status === 404 && errorData.error?.message?.includes('not found')) {
                console.log('Trying fallback model: gemini-pro');
                
                const fallbackURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                const fallbackResponse = await fetch(`${fallbackURL}?key=${GOOGLE_AI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: conversationText }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 1000,
                            temperature: 0.7
                        }
                    })
                });
                
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.candidates?.[0]?.content?.parts?.[0]?.text) {
                        return {
                            statusCode: 200,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                message: fallbackData.candidates[0].content.parts[0].text,
                                success: true,
                                model: 'gemini-pro (fallback)'
                            })
                        };
                    }
                }
            }
            
            throw new Error(`Google AI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Invalid response format from Google AI Studio API');
        }

        const aiMessage = data.candidates[0].content.parts[0].text;

        // Return successful response
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
                model: 'gemini-1.5-flash-latest'
            })
        };

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
                success: false 
            })
        };
    }
};