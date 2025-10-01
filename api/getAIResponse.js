/**
 * Project Zion AI API - Simplified Cohere Integration
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are an AI assistant for Project Zion, providing support for cybercrime victims. Be empathetic, helpful, and concise (under 150 words). Ask for context when needed: what happened, how, when, and what device/platform. Focus on practical cybersecurity advice and emotional support.`;

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'command-r-plus-08-2024',
        message: message.trim(),
        preamble: systemPrompt,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    const reply = data.text?.trim() || 'I apologize, but I couldn\'t generate a response.';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}