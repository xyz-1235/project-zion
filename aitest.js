/**
 * Project Zion AI - Front-end JavaScript Implementation
 * Class-based chat interface with secure backend communication
 */

class ProjectZionAI {
  constructor() {
    // DOM elements
    this.chatContainer = null;
    this.messageInput = null;
    this.sendButton = null;
    this.chatMessages = null;
    this.loadingIndicator = null;
    
    // Application state
    this.isLoading = false;
    this.messageHistory = [];
    
    // Configuration
    this.apiEndpoint = '/.netlify/functions/getAIResponse';
    this.maxMessageLength = 1000;
    this.requestTimeout = 30000; // 30 seconds
    
    // Initialize the application
    this.init();
  }

  /**
   * Initialize the AI chat interface
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDOM());
    } else {
      this.setupDOM();
    }
  }

  /**
   * Set up DOM elements and event listeners
   */
  setupDOM() {
    // Create chat interface if it doesn't exist
    this.createChatInterface();
    
    // Get DOM elements
    this.chatContainer = document.getElementById('ai-chat-container');
    this.messageInput = document.getElementById('ai-message-input');
    this.sendButton = document.getElementById('ai-send-button');
    this.chatMessages = document.getElementById('ai-chat-messages');
    this.loadingIndicator = document.getElementById('ai-loading-indicator');

    if (!this.chatContainer || !this.messageInput || !this.sendButton || !this.chatMessages) {
      console.error('ProjectZionAI: Required DOM elements not found');
      return;
    }

    // Set up event listeners
    this.setupEventListeners();
    
    // Add welcome message
    this.addMessage('system', 'Welcome to Project Zion AI! How can I help you today?');
  }

  /**
   * Create the chat interface HTML if it doesn't exist
   */
  createChatInterface() {
    // Check if interface already exists
    if (document.getElementById('ai-chat-container')) {
      return;
    }

    const chatHTML = `
      <div id="ai-chat-container" class="ai-chat-container">
        <div id="ai-chat-messages" class="ai-chat-messages"></div>
        <div class="ai-input-container">
          <textarea 
            id="ai-message-input" 
            class="ai-message-input" 
            placeholder="Type your message here..."
            rows="3"
            maxlength="${this.maxMessageLength}"></textarea>
          <button id="ai-send-button" class="ai-send-button">Send</button>
        </div>
        <div id="ai-loading-indicator" class="ai-loading-indicator" style="display: none;">
          <span class="ai-typing-dots">AI is typing...</span>
        </div>
      </div>
    `;

    // Add to the page (append to body or a specific container)
    const targetContainer = document.getElementById('main-content') || document.body;
    targetContainer.insertAdjacentHTML('beforeend', chatHTML);

    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the chat interface
   */
  addStyles() {
    const styles = `
      <style id="ai-chat-styles">
        .ai-chat-container {
          max-width: 800px;
          margin: 20px auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .ai-chat-messages {
          height: 400px;
          overflow-y: auto;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .ai-message {
          margin-bottom: 15px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 80%;
          word-wrap: break-word;
        }
        
        .ai-message.user {
          background: #007bff;
          color: white;
          margin-left: auto;
          text-align: right;
        }
        
        .ai-message.ai {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #dee2e6;
        }
        
        .ai-message.system {
          background: #e7f3ff;
          color: #0066cc;
          text-align: center;
          margin: 0 auto;
        }
        
        .ai-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .ai-input-container {
          display: flex;
          padding: 15px;
          gap: 10px;
        }
        
        .ai-message-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
        }
        
        .ai-message-input:focus {
          outline: none;
          border-color: #007bff;
        }
        
        .ai-send-button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        
        .ai-send-button:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .ai-send-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .ai-loading-indicator {
          padding: 10px 20px;
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }
        
        .ai-typing-dots::after {
          content: '...';
          animation: ai-typing 1.5s infinite;
        }
        
        @keyframes ai-typing {
          0%, 60% { content: '...'; }
          20% { content: '.'; }
          40% { content: '..'; }
        }
        
        .ai-timestamp {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 5px;
        }
      </style>
    `;

    if (!document.getElementById('ai-chat-styles')) {
      document.head.insertAdjacentHTML('beforeend', styles);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // Enter key to send (Shift+Enter for new line)
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => {
      this.autoResizeTextarea();
    });
  }

  /**
   * Auto-resize the textarea based on content
   */
  autoResizeTextarea() {
    this.messageInput.style.height = 'auto';
    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage() {
    const message = this.messageInput.value.trim();
    
    // Validate message
    if (!message) {
      this.addMessage('error', 'Please enter a message before sending.');
      return;
    }

    if (message.length > this.maxMessageLength) {
      this.addMessage('error', `Message too long. Maximum ${this.maxMessageLength} characters allowed.`);
      return;
    }

    if (this.isLoading) {
      return; // Prevent multiple simultaneous requests
    }

    // Add user message to chat
    this.addMessage('user', message);
    
    // Clear input and reset height
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    
    // Set loading state
    this.setLoadingState(true);
    
    try {
      // Call the AI
      const response = await this.callAI(message);
      
      // Add AI response to chat
      this.addMessage('ai', response);
      
    } catch (error) {
      console.error('Error calling AI:', error);
      this.addMessage('error', error.message || 'Failed to get AI response. Please try again.');
    } finally {
      // Clear loading state
      this.setLoadingState(false);
    }
  }

  /**
   * Call the AI backend function
   */
  async callAI(message) {
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
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  }

  /**
   * Add a message to the chat
   */
  addMessage(type, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `ai-message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    const timestampElement = `<div class="ai-timestamp">${timestamp}</div>`;
    
    messageElement.innerHTML = `
      <div>${this.escapeHtml(content)}</div>
      ${type !== 'system' ? timestampElement : ''}
    `;

    this.chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    // Store in history
    this.messageHistory.push({
      type,
      content,
      timestamp: new Date()
    });
  }

  /**
   * Set loading state
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    this.sendButton.disabled = loading;
    this.messageInput.disabled = loading;
    
    if (loading) {
      this.loadingIndicator.style.display = 'block';
      this.sendButton.textContent = 'Sending...';
    } else {
      this.loadingIndicator.style.display = 'none';
      this.sendButton.textContent = 'Send';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear chat history
   */
  clearChat() {
    this.chatMessages.innerHTML = '';
    this.messageHistory = [];
    this.addMessage('system', 'Chat cleared. How can I help you?');
  }

  /**
   * Get chat history
   */
  getChatHistory() {
    return [...this.messageHistory];
  }

  /**
   * Destroy the chat interface
   */
  destroy() {
    if (this.chatContainer) {
      this.chatContainer.remove();
    }
    
    const styles = document.getElementById('ai-chat-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Auto-initialize when script loads
let projectZionAI;

// Initialize the AI chat interface
document.addEventListener('DOMContentLoaded', () => {
  projectZionAI = new ProjectZionAI();
});

// Make it available globally for manual initialization if needed
window.ProjectZionAI = ProjectZionAI;