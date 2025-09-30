// Project Zion - AI Powered Chat Interface
// Netlify serverless integration for secure API calls

/* 
 * NETLIFY DEPLOYMENT SETUP:
 * 
 * This version uses Netlify serverless functions for secure API calls.
 * 
 * 1. Your repo is already linked to Netlify ✓
 * 2. Set environment variable in Netlify dashboard:
 *    - Go to Site settings → Environment variables
 *    - Add: GOOGLE_AI_API_KEY = AIzaSyAM1vn_fYcAeFSDdyV1SXyZShzfnR_RlS8
 * 3. Deploy your site
 * 4. The AI chat will work securely through Netlify functions
 * 
 * No API key needed in this file - it's securely stored on Netlify servers.
 */

class ProjectZionAI {
    constructor() {
        this.conversationHistory = [];
        this.isConnected = false;
        this.lastVersion = null;
        this.lastModel = null;
        this.lastEndpoint = null;
        
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
            this.setAIStatus('connecting', 'Checking AI service...');
            
            // Check Netlify function health
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.apiConfigured) {
                    this.isConnected = true;
                    this.setAIStatus('connected', 'AI Ready');
                } else {
                    throw new Error('API key not configured in Netlify environment variables');
                }
            } else {
                throw new Error('Netlify function not responding');
            }
        } catch (error) {
            console.error('API configuration check failed:', error);
            this.isConnected = false;
            if (error.message.includes('API key not configured')) {
                this.setAIStatus('error', 'Configure API key in Netlify dashboard');
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
        // Add user message to conversation history
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        });

        // Call Netlify serverless function
        const response = await fetch('/api/getAIResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: this.conversationHistory,
                systemPrompt: this.systemPrompt
            })
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // If we can't parse error response, use default message
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.success || !data.message) {
            throw new Error('Invalid response format from AI service');
        }

        // Store version info for display
        if (data.version) {
            this.lastVersion = data.version;
            this.lastModel = data.model;
            this.lastEndpoint = data.endpoint;
            this.updateVersionDisplay();
        }

        const assistantMessage = data.message;

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
        this.setAIStatus('error', 'AI Service Error');
        
        let errorMessage = 'I apologize, but I\'m having trouble connecting to the AI service right now. ';
        
        if (error.message.includes('API key not configured')) {
            errorMessage = '🔧 **Netlify Configuration Required**: Please configure your API key in Netlify.\n\n';
            errorMessage += '**Steps to configure:**\n';
            errorMessage += '1. Go to your Netlify dashboard\n';
            errorMessage += '2. Navigate to Site settings → Environment variables\n';
            errorMessage += '3. Add new variable: GOOGLE_AI_API_KEY = AIzaSyAM1vn_fYcAeFSDdyV1SXyZShzfnR_RlS8\n';
            errorMessage += '4. Redeploy your site\n\n';
            errorMessage += 'Your API key will be securely stored on Netlify servers.';
        } else if (error.message.includes('function not responding')) {
            errorMessage += '**Deployment Issue**: The Netlify functions may not be deployed correctly. Check your deployment logs.';
        } else if (error.message.includes('401') || error.message.includes('403') || error.message.includes('API_KEY_INVALID')) {
            errorMessage += '**Invalid API Key**: Please check that your Google AI Studio API key is correct in Netlify environment variables.';
        } else if (error.message.includes('429')) {
            errorMessage += '**Rate Limited**: Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('quota') || error.message.includes('billing')) {
            errorMessage += '**Quota Exceeded**: Please check your Google AI Studio account usage limits.';
        } else if (error.message.includes('SAFETY')) {
            errorMessage += '**Content Safety**: The response was blocked due to safety policies. Please try rephrasing your question.';
        } else {
            errorMessage += `**Error Details**: ${error.message}\n\nPlease check your Netlify configuration and try again.`;
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

    updateVersionDisplay() {
        const statusElement = document.getElementById('ai-status-text');
        const versionElement = document.getElementById('version-info');
        
        if (statusElement && this.lastVersion) {
            const versionInfo = `AI Ready (v${this.lastVersion} - ${this.lastModel})`;
            statusElement.textContent = versionInfo;
        }
        
        if (versionElement && this.lastVersion) {
            versionElement.innerHTML = `
                Function Version: <strong>${this.lastVersion}</strong> | 
                Model: <strong>${this.lastModel}</strong> | 
                Status: <span style="color: #10b981;">Active</span>
            `;
        }
        
        // Log detailed version info to console
        if (this.lastVersion) {
            console.log(`🤖 AI Service Info:
Version: ${this.lastVersion}
Model: ${this.lastModel}
Endpoint: ${this.lastEndpoint}`);
        }
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