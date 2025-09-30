/**
 * Project Zion - AI-Powered Chatbot Application Logic
 * Integrates with Cohere AI through secure Netlify Functions
 */

class ZionChatbot {
    constructor() {
        // DOM elements
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        
        // Application state
        this.isProcessing = false;
        this.messageHistory = [];
        
        // Configuration
        this.apiEndpoint = '/api/getAIResponse';
        this.maxMessageLength = 1000;
        this.requestTimeout = 30000; // 30 seconds
        
        // Initialize the application
        this.init();
    }
    
    init() {
        if (!this.chatWindow || !this.userInput || !this.sendButton) {
            console.error('ZionChatbot: Required DOM elements not found');
            return;
        }
        
        this.initializeEventListeners();
        this.addWelcomeMessage();
        this.userInput.focus();
    }
    
    initializeEventListeners() {
        // Send button click handler
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleUserMessage();
        });
        
        // Enter key handler for input field (Shift+Enter for new line)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });
        
        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }
    
    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 150) + 'px';
    }
    
    addWelcomeMessage() {
        const welcomeMessage = "Hello! I'm Zion, your AI-powered digital security assistant. I'm here to help you with cybersecurity concerns, privacy questions, and support if you've been a victim of cybercrime. How can I assist you today?";
        this.displayMessage(welcomeMessage, 'bot');
    }
    
    async handleUserMessage() {
        const message = this.userInput.value.trim();
        
        // Validate input
        if (!message || this.isProcessing) {
            return;
        }
        
        if (message.length > this.maxMessageLength) {
            this.displayMessage(`Message too long. Maximum ${this.maxMessageLength} characters allowed.`, 'error');
            return;
        }
        
        // Display user message
        this.displayMessage(message, 'user');
        
        // Store in history
        this.messageHistory.push({ type: 'user', content: message, timestamp: new Date() });
        
        // Clear input and disable form
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.setProcessingState(true);
        
        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.callAI(message);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Display AI response
            this.displayMessage(response, 'bot');
            
            // Store in history
            this.messageHistory.push({ type: 'bot', content: response, timestamp: new Date() });
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.removeTypingIndicator(typingIndicator);
            this.displayMessage(error.message || 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.', 'error');
        } finally {
            // Re-enable form and focus input
            this.setProcessingState(false);
            this.userInput.focus();
        }
    }
    
    async callAI(message) {
        return await this.callNetlifyFunction(message);
    }
    
    async callNetlifyFunction(message) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.reply) {
                throw new Error('Invalid response format from server.');
            }
            
            return data.reply;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Unable to reach the AI service. Check your connection or try again soon.');
            }

            throw new Error(error.message || 'The AI service encountered an unexpected error.');
        }
    }
    
    displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let avatar;
        switch(sender) {
            case 'bot':
                avatar = 'Z';
                break;
            case 'user':
                avatar = 'U';
                break;
            case 'error':
                avatar = '⚠';
                break;
            default:
                avatar = '?';
        }
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">${avatar}</div>
                <div class="message-text">${this.formatMessage(text)}</div>
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;
        
        this.chatWindow.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(text) {
        // Escape HTML to prevent XSS
        const div = document.createElement('div');
        div.textContent = text;
        const escapedText = div.innerHTML;
        
        // Convert line breaks to HTML breaks
        return escapedText.replace(/\n/g, '<br>');
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">Z</div>
                <div class="message-text">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">Zion is thinking...</span>
                </div>
            </div>
        `;
        
        this.chatWindow.appendChild(typingDiv);
        this.scrollToBottom();
        
        return typingDiv;
    }
    
    removeTypingIndicator(typingIndicator) {
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }
    }
    
    setProcessingState(isProcessing) {
        this.isProcessing = isProcessing;
        this.sendButton.disabled = isProcessing;
        this.userInput.disabled = isProcessing;
        
        if (isProcessing) {
            this.sendButton.textContent = 'Sending...';
            this.sendButton.classList.add('processing');
        } else {
            this.sendButton.textContent = 'Send';
            this.sendButton.classList.remove('processing');
        }
    }
    
    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }
    
    // Utility methods
    clearChat() {
        this.chatWindow.innerHTML = '';
        this.messageHistory = [];
        this.addWelcomeMessage();
    }
    
    getChatHistory() {
        return [...this.messageHistory];
    }
    
    exportChatHistory() {
        const history = this.getChatHistory();
        const exportData = {
            timestamp: new Date().toISOString(),
            messages: history,
            sessionId: this.getSessionId()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zion-chat-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('zion-session-id');
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('zion-session-id', sessionId);
        }
        return sessionId;
    }
}

// Initialize the chatbot when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zionChatbot = new ZionChatbot();
});

// Additional utility functions and API helpers
const ZionUtils = {
    // Session management
    getSessionId() {
        return window.zionChatbot ? window.zionChatbot.getSessionId() : null;
    },
    
    // Chat management
    clearChat() {
        if (window.zionChatbot) {
            window.zionChatbot.clearChat();
        }
    },
    
    exportHistory() {
        if (window.zionChatbot) {
            window.zionChatbot.exportChatHistory();
        }
    },
    
    // Debug utilities
    getHistory() {
        return window.zionChatbot ? window.zionChatbot.getChatHistory() : [];
    },
    
    // Network status check
    async checkAPIStatus() {
        // Check Vercel API function for production deployment
        try {
            const response = await fetch('/api/getAIResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'test' })
            });
            
            return {
                status: response.ok ? 'online' : 'error',
                statusCode: response.status,
                message: response.ok ? 'AI service is operational (Vercel API)' : 'AI service has issues',
                mode: 'vercel'
            };
        } catch (error) {
            return {
                status: 'offline',
                statusCode: 0,
                message: 'Cannot reach AI service',
                mode: 'offline'
            };
        }
    }
};

// Make utilities available globally
window.ZionUtils = ZionUtils;