// This is your secure backend function. It runs on a server, not in the browser.

exports.handler = async function(event, context) {
    // 1. Get the user's message from the front-end request.
    const { message } = JSON.parse(event.body);

    // 2. Access the secret API key from Netlify's environment variables.
    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    const API_URL = 'https://generativelace.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // 3. Call the Google AI API from the server.
    try {
        const response = await fetch(`${API_URL}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;

        // 4. Send the AI's response back to the front-end.
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiMessage }),
        };

    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get response from AI." }),
        };
    }
};