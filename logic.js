// Project Zion - Chatbot Application Logic
// Professional front-end implementation with placeholder AI integration

class ZionChatbot {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        this.isProcessing = false;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Send button click handler
        this.sendButton.addEventListener('click', () => this.handleUserMessage());
        
        // Enter key handler for input field
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });
        
        // Auto-focus input on page load
        this.userInput.focus();
    }
    
    async handleUserMessage() {
        const message = this.userInput.value.trim();
        
        // Validate input
        if (!message || this.isProcessing) {
            return;
        }
        
        // Display user message
        this.displayMessage(message, 'user');
        
        // Clear input and disable form
        this.userInput.value = '';
        this.setProcessingState(true);
        
        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getZionResponse(message);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Display AI response
            this.displayMessage(response, 'bot');
            
        } catch (error) {
            console.error('Error getting response:', error);
            this.removeTypingIndicator(typingIndicator);
            this.displayMessage('I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.', 'bot');
        } finally {
            // Re-enable form and focus input
            this.setProcessingState(false);
            this.userInput.focus();
        }
    }
    
    async getZionResponse(message) {
        // Simulate network delay (1.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // TODO: Replace with actual API call
        // const response = await fetch('/api/chat', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ message: message })
        // });
        // return await response.json();
        
        // Placeholder keyword-based response system
        return this.generatePlaceholderResponse(message);
    }
    
    generatePlaceholderResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm Zion, your digital security assistant. I'm here to help you with any cybersecurity concerns, privacy questions, or if you've been a victim of cybercrime. How can I support you today?";
        }
        
        // Help-related responses
        if (lowerMessage.includes('help') || lowerMessage.includes('assistance') || lowerMessage.includes('support')) {
            return "I'm here to help you with various digital security matters including:\n\n• Reporting and recovering from cybercrime\n• Understanding online safety measures\n• Protecting your digital privacy\n• Securing your accounts and devices\n• Understanding suspicious online activity\n\nWhat specific area would you like guidance on?";
        }
        
        // Scam-related responses
        if (lowerMessage.includes('scam') || lowerMessage.includes('fraud') || lowerMessage.includes('suspicious')) {
            return "I understand you may be dealing with a potential scam or fraudulent activity. This can be very stressful, but you've taken the right step by seeking help.\n\nTo better assist you:\n• Can you describe what happened?\n• Have you shared any personal information?\n• Have you lost any money?\n\nRemember, you're not alone in this, and there are steps we can take to help protect you.";
        }
        
        // Cybercrime responses
        if (lowerMessage.includes('hack') || lowerMessage.includes('breach') || lowerMessage.includes('stolen') || lowerMessage.includes('compromised')) {
            return "I'm sorry to hear you may have experienced a security breach. Your safety and security are my priority.\n\nImmediate steps to consider:\n• Change passwords for affected accounts\n• Enable two-factor authentication\n• Monitor your accounts for unusual activity\n• Consider reporting to relevant authorities\n\nWould you like detailed guidance on any of these steps?";
        }
        
        // Privacy concerns
        if (lowerMessage.includes('privacy') || lowerMessage.includes('data') || lowerMessage.includes('information')) {
            return "Privacy protection is crucial in today's digital world. I can help you understand:\n\n• How to control your personal data online\n• Privacy settings for social media and apps\n• Safe browsing practices\n• Data protection rights\n\nWhat specific privacy concerns would you like to address?";
        }
        
        // Emergency or urgent situations
        if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('immediately')) {
            return "I understand this feels urgent. For immediate assistance with cybercrime:\n\n• Contact your local law enforcement\n• Report to relevant authorities (FBI IC3, FTC, etc.)\n• Contact your bank if financial information is involved\n• Preserve any evidence you have\n\nI'm here to guide you through these steps. What type of incident are you dealing with?";
        }
        
        // General supportive response
        const supportiveResponses = [
            "Thank you for reaching out. I'm here to help you navigate any digital security challenges you're facing. Could you tell me more about your specific situation?",
            
            "I appreciate you taking the step to seek help. Digital safety is important, and I'm here to provide guidance and support. What would you like to discuss?",
            
            "Your digital security and peace of mind matter. I'm equipped to help with various cybersecurity concerns. What brings you to Project Zion today?",
            
            "I'm here to provide a safe space for discussing any digital security issues you might be experiencing. How can I best assist you?"
        ];
        
        return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
    }
    
    displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'bot' ? 'Z' : 'U';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">${avatar}</div>
                <div class="message-text">${this.formatMessage(text)}</div>
            </div>
        `;
        
        this.chatWindow.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(text) {
        // Convert line breaks to HTML breaks
        return text.replace(/\n/g, '<br>');
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
            this.sendButton.textContent = 'Processing...';
        } else {
            this.sendButton.textContent = 'Send';
        }
    }
    
    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }
}

// Initialize the chatbot when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ZionChatbot();
});

// Additional utility functions for future API integration
const ZionAPI = {
    // Placeholder for future API configuration
    baseURL: '/api',
    
    // Future method for real API calls
    async sendMessage(message) {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers as needed
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },
    
    getSessionId() {
        // Generate or retrieve session ID for user tracking
        let sessionId = sessionStorage.getItem('zion-session-id');
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('zion-session-id', sessionId);
        }
        return sessionId;
    }
};