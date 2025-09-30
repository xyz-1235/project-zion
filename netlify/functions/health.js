// Project Zion - Health Check Function for Netlify
// Simple function to check if the API is working
// Version: 1.1 - Added version tracking

const HEALTH_VERSION = "1.1";

exports.handler = async function(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Check if API key is configured
        const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
        
        const isConfigured = !!GOOGLE_AI_API_KEY;
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'healthy',
                apiConfigured: isConfigured,
                timestamp: new Date().toISOString(),
                message: isConfigured ? 'AI service ready' : 'API key not configured'
            })
        };

    } catch (error) {
        console.error("Health check error:", error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'error',
                message: 'Health check failed',
                error: error.message
            })
        };
    }
};