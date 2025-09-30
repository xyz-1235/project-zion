// Project Zion - AI Powered Chat Interface
// Real AI API integration for cybersecurity support

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
        this.checkServerConnection();
    }

    async checkServerConnection() {
        try {
            this.setAIStatus('connecting', 'Connecting to AI service...');
            
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.isConnected = true;
                this.setAIStatus('connected', 'AI Ready');
            } else {
                throw new Error('Server not responding');
            }
        } catch (error) {
            console.error('Server connection failed:', error);
            this.isConnected = false;
            this.setAIStatus('error', 'AI Service Unavailable');
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

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: this.systemPrompt
                    },
                    ...this.conversationHistory
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
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
        this.setAIStatus('error', 'AI Error - Check configuration');
        
        let errorMessage = 'I apologize, but I\'m having trouble connecting to the AI service right now. ';
        
        if (error.message.includes('401')) {
            errorMessage += 'Please check your API key in the configuration panel.';
        } else if (error.message.includes('429')) {
            errorMessage += 'I\'m receiving too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('quota')) {
            errorMessage += 'The API quota has been exceeded. Please check your OpenAI account.';
        } else {
            errorMessage += 'Please try again or check your internet connection.';
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