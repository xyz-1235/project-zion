// Project Zion - AI Powered Chat Interface
// Real AI API integration for cybersecurity support

/* * QUICK SETUP GUIDE:
 * * 1. Get your Google AI Studio API key from https://aistudio.google.com/app/apikey
 * 2. Replace 'your-google-ai-api-key-here' below with your actual API key
 * 3. Save this file and refresh the page
 * 4. That's it! The AI chat should work immediately.
 * * Note: This implementation calls Google AI Studio (Gemini) directly from the browser.
 * For production use, consider using a backend server to protect your API key.
 */

// =================================
// CONFIGURATION - ADD YOUR API KEY HERE
// =================================
const CONFIG = {
    // Replace 'your-google-ai-api-key-here' with your actual Google AI Studio API key
    GOOGLE_AI_API_KEY: 'AIzaSyAM1vn_fYcAeFSDdyV1SXyZShzfnR_RlS8',
    
    // Google AI Studio API settings (you can modify these if needed)
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    MODEL: 'gemini-pro',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7
};

class ProjectZionAI {
    constructor() {
        this.conversationHistory = [];
        this.isConnected = false;
        
        this.systemPrompt = `You are a specialized AI assistant for Project Zion, designed to help victims of cybercrime, digital harassment, and privacy violations. You provide empathetic, non-judgmental support while offering practical, actionable guidance on cybersecurity, digital safety, and privacy protection.

Your responses should be:
1. Compassionate and validating - acknowledge the user's distress
2. Technically accurate and helpful - provide correct cybersecurity advice
3. Focused on user safety and privacy - prioritize immediate security measures
4. Clear and actionable - give step-by-step instructions when needed
5. Appropriate for someone who may be in distress - avoid overwhelming technical jargon

Key guidelines:
- Always prioritize the user's immediate safety and well-being
- Recommend contacting authorities for serious crimes or immediate threats
- Suggest professional help for complex legal or financial issues
- Provide resources and next steps, not just sympathy
- If unsure about something, say so and suggest getting expert help
- Never ask for personal information that could compromise their privacy

Remember: You are a safe space for people who have been digitally victimized.`;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAPIConfiguration();
    }

    async checkAPIConfiguration() {
        try {
            this.setAIStatus('connecting', 'Checking AI configuration...');
            
            // Check if API key is configured
            if (!CONFIG.GOOGLE_AI_API_KEY || CONFIG.GOOGLE_AI_API_KEY === 'your-google-ai-api-key-here') {
                throw new Error('API key not configured');
            }
            
            // Test API connection with a simple request
            const testResponse = await fetch(`${CONFIG.API_URL}?key=${CONFIG.GOOGLE_AI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Test connection' }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 1,
                        temperature: CONFIG.TEMPERATURE
                    }
                })
            });
            
            if (testResponse.ok || testResponse.status === 400) {
                // 400 might mean API key is valid but request format issues
                this.isConnected = true;
                this.setAIStatus('connected', 'AI Ready');
            } else {
                throw new Error('API connection failed');
            }
        } catch (error) {
            console.error('API configuration check failed:', error);
            this.isConnected = false;
            if (error.message === 'API key not configured') {
                this.setAIStatus('error', 'Please configure API key in aitest.js');
            } else {
                this.setAIStatus('error', 'AI Service Configuration Error');
            }
        }
    }

    setupEventListeners() {
        // Main chat functionality
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat functionality (Ctrl+Escape)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && e.ctrlKey) {
                this.clearChat();
            }
        });
    }

    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();
        
        if (!message) return;
        
        if (!this.isConnected) {
            this.showNotification('AI service is not available. Please try again later.', 'error');
            return;
        }

        // Add user message to chat
        this.addMessageToChat('user', message);
        userInput.value = '';

        // Show AI is typing
        this.setAIStatus('connecting', 'AI is thinking...');
        this.disableInput(true);

        try {
            const response = await this.callAI(message);
            this.addMessageToChat('assistant', response);
            this.setAIStatus('connected', 'AI Ready');
        } catch (error) {
            console.error('AI Error:', error);
            this.handleAIError(error);
        } finally {
            this.disableInput(false);
        }
    }

    async callAI(userMessage) {
        // Check if API is configured
        if (!CONFIG.GOOGLE_AI_API_KEY || CONFIG.GOOGLE_AI_API_KEY === 'your-google-ai-api-key-here') {
            throw new Error('Google AI Studio API key not configured. Please add your API key to the CONFIG section in aitest.js');
        }

        // Add user message to conversation history
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        });

        // Build conversation context for Gemini
        let conversationText = this.systemPrompt + "\n\n";
        
        // Add conversation history
        this.conversationHistory.forEach(msg => {
            if (msg.role === "user") {
                conversationText += `User: ${msg.content}\n\n`;
            } else if (msg.role === "assistant") {
                conversationText += `Assistant: ${msg.content}\n\n`;
            }
        });
        
        conversationText += "Assistant: ";

        // Call Google AI Studio API
        const response = await fetch(`${CONFIG.API_URL}?key=${CONFIG.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: conversationText }]
                }],
                generationConfig: {
                    maxOutputTokens: CONFIG.MAX_TOKENS,
                    temperature: CONFIG.TEMPERATURE
                }
            })
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                }
            } catch (e) {
                // If we can't parse error response, use default message
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Invalid response format from Google AI Studio API');
        }

        const assistantMessage = data.candidates[0].content.parts[0].text;

        // Add assistant response to conversation history
        this.conversationHistory.push({
            role: "assistant",
            content: assistantMessage
        });

        return assistantMessage;
    }

    addMessageToChat(role, message) {
        const chatWindow = document.getElementById('chat-window');
        const messageDiv = document.createElement('div');
        
        if (role === 'user') {
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(message)}</div>
                    <div class="message-avatar">You</div>
                </div>
            `;
        } else {
            messageDiv.className = 'message bot-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-avatar">Z</div>
                    <div class="message-text">${this.escapeHtml(message)}</div>
                </div>
            `;
        }

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    handleAIError(error) {
        this.setAIStatus('error', 'AI Configuration Error');
        
        let errorMessage = 'I apologize, but I\'m having trouble connecting to the AI service right now. ';
        
        if (error.message.includes('API key not configured')) {
            errorMessage = '🔧 **Configuration Required**: Please add your Google AI Studio API key to get started.\n\n';
            errorMessage += '**Steps to configure:**\n';
            errorMessage += '1. Open the `aitest.js` file in a text editor\n';
            errorMessage += '2. Find the CONFIG section at the top\n';
            errorMessage += '3. Replace `your-google-ai-api-key-here` with your actual Google AI Studio API key\n';
            errorMessage += '4. Save the file and refresh this page\n\n';
            errorMessage += 'Get your API key at: https://aistudio.google.com/app/apikey';
        } else if (error.message.includes('401') || error.message.includes('403') || error.message.includes('API_KEY_INVALID')) {
            errorMessage += '**Invalid API Key**: Please check that your Google AI Studio API key is correct in the CONFIG section of aitest.js';
        } else if (error.message.includes('429')) {
            errorMessage += '**Rate Limited**: Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('quota') || error.message.includes('billing')) {
            errorMessage += '**Quota Exceeded**: Please check your Google AI Studio account usage limits.';
        } else if (error.message.includes('model')) {
            errorMessage += '**Model Error**: The specified model may not be available. Check your API access level.';
        } else if (error.message.includes('SAFETY')) {
            errorMessage += '**Content Safety**: The response was blocked due to safety policies. Please try rephrasing your question.';
        } else {
            errorMessage += `**Error Details**: ${error.message}\n\nPlease check your configuration and try again.`;
        }

        this.addMessageToChat('assistant', errorMessage);
    }

    setAIStatus(status, text) {
        const statusDot = document.getElementById('ai-status-dot');
        const statusText = document.getElementById('ai-status-text');
        
        statusDot.className = `status-indicator status-${status}`;
        statusText.textContent = text;
    }

    disableInput(disabled) {
        document.getElementById('user-input').disabled = disabled;
        document.getElementById('send-btn').disabled = disabled;
    }

    clearChat() {
        const chatWindow = document.getElementById('chat-window');
        // Keep only the welcome message
        const welcomeMessage = chatWindow.querySelector('.bot-message');
        chatWindow.innerHTML = '';
        if (welcomeMessage) {
            chatWindow.appendChild(welcomeMessage);
        }
        
        // Clear conversation history
        this.conversationHistory = [];
        
        this.showNotification('Chat cleared', 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ef4444' : 'var(--zion-green)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: var(--shadow-deep);
            z-index: 1001;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the AI chat interface when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProjectZionAI();
});