/**
 * Project Zion - Chat Logic with Scenario Selection
 */

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const scenarioSelection = document.getElementById('scenario-selection');
const downloadChatBtn = document.getElementById('download-chat-btn');

let isProcessing = false;
let selectedScenario = null;
let chatHistory = [];

// Initialize
if (chatWindow && userInput && sendButton) {
    initializeChat();
}

function initializeChat() {
    // Scenario selection handlers
    if (scenarioSelection) {
        document.querySelectorAll('.scenario-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedScenario = button.dataset.scenario;
                startChatWithScenario(selectedScenario);
            });
        });
        
        const skipBtn = document.getElementById('skip-scenario');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                selectedScenario = 'general';
                startChatWithScenario('general');
            });
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });
    
    // Text size controls
    document.querySelectorAll('.text-size-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.text-size-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            chatWindow.className = chatWindow.className.replace(/text-(small|medium|large)/g, '');
            chatWindow.classList.add(`text-${button.dataset.size}`);
        });
    });
    
    // Download chat button
    if (downloadChatBtn) {
        downloadChatBtn.addEventListener('click', downloadChatHistory);
        downloadChatBtn.style.display = 'none'; // Hidden until chat starts
    }
}

function startChatWithScenario(scenario) {
    // Hide scenario selection
    if (scenarioSelection) {
        scenarioSelection.style.display = 'none';
    }
    
    // Show chat interface and download button
    chatWindow.style.display = 'block';
    if (downloadChatBtn) {
        downloadChatBtn.style.display = 'flex';
    }
    
    // Display scenario-specific welcome message
    const welcomeMessages = {
        'scammed': "I'm here to help you secure your accounts after a scam. Let's take this step by step. First, can you tell me what happened?",
        'harassment': "I'm sorry you're experiencing online harassment. Your safety is important. Can you describe what's been happening?",
        'identity-theft': "Identity theft is serious, but we can work through this together. First, let's assess the situation. What makes you believe your identity was stolen?",
        'phishing': "Let's make sure you're safe. Can you tell me what link you clicked or what happened? Don't worry, we'll handle this.",
        'account-hacked': "Let's secure your account immediately. Which account was compromised (email, social media, banking, etc.)?",
        'general': "Hi, I'm Zion. You're safe here. How can I help you today?"
    };
    
    displayMessage(welcomeMessages[scenario] || welcomeMessages['general'], 'bot');
    userInput.focus();
}

async function handleUserMessage() {
    const message = userInput.value.trim();
    
    if (!message || isProcessing) return;
    
    displayMessage(message, 'user');
    userInput.value = '';
    setProcessingState(true);
    
    const typingIndicator = showTypingIndicator();
    
    try {
        const response = await fetch('/api/getAIResponse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message,
                scenario: selectedScenario || 'general'
            })
        });
        
        const data = await response.json();
        removeTypingIndicator(typingIndicator);
        displayMessage(data.reply || 'Sorry, I encountered an error.', 'bot');
        
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        displayMessage('Sorry, I\'m having technical difficulties. Please try again.', 'bot');
    } finally {
        setProcessingState(false);
        userInput.focus();
    }
}

function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const avatar = sender === 'bot' ? 'Z' : 'U';
    const timestamp = new Date().toLocaleTimeString();
    
    // Store message in chat history
    chatHistory.push({
        sender: sender === 'bot' ? 'Zion AI' : 'You',
        message: text,
        timestamp: new Date().toLocaleString()
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">${avatar}</div>
            <div class="message-text">${formatMessage(text, sender)}
                <div class="message-timestamp">${timestamp}</div>
            </div>
        </div>
    `;
    
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function formatMessage(text, sender) {
    if (sender === 'bot') {
        // Simple markdown formatting
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        return formatted;
    } else {
        // Escape HTML for user messages
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }
}

function showTypingIndicator() {
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
    
    chatWindow.appendChild(typingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

function setProcessingState(processing) {
    isProcessing = processing;
    sendButton.disabled = processing;
    sendButton.textContent = processing ? 'Sending...' : 'Send';
}

function downloadChatHistory() {
    if (chatHistory.length === 0) {
        alert('No chat history to download. Start a conversation first!');
        return;
    }
    
    // Format chat history as neat text
    let chatText = '═══════════════════════════════════════════════════════════════\n';
    chatText += '                    PROJECT ZION - CHAT HISTORY                 \n';
    chatText += '═══════════════════════════════════════════════════════════════\n\n';
    chatText += `Downloaded: ${new Date().toLocaleString()}\n`;
    chatText += `Scenario: ${selectedScenario ? selectedScenario.replace('-', ' ').toUpperCase() : 'GENERAL'}\n`;
    chatText += `Total Messages: ${chatHistory.length}\n\n`;
    chatText += '───────────────────────────────────────────────────────────────\n\n';
    
    // Add each message
    chatHistory.forEach((msg, index) => {
        chatText += `[${msg.timestamp}] ${msg.sender}:\n`;
        // Clean up HTML formatting for plain text
        const cleanMessage = msg.message
            .replace(/<br>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<[^>]*>/g, '') // Remove any other HTML tags
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        chatText += `${cleanMessage}\n\n`;
        
        if (index < chatHistory.length - 1) {
            chatText += '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n';
        }
    });
    
    chatText += '───────────────────────────────────────────────────────────────\n\n';
    chatText += '                   IMPORTANT DISCLAIMER                         \n';
    chatText += '───────────────────────────────────────────────────────────────\n';
    chatText += 'This chat history is provided for your personal records only.\n';
    chatText += 'The information provided is general guidance and should not be\n';
    chatText += 'considered as legal, financial, or professional advice.\n\n';
    chatText += 'For immediate help in India:\n';
    chatText += '  • National Cyber Crime Helpline: 1930\n';
    chatText += '  • Cyber Crime Portal: www.cybercrime.gov.in\n';
    chatText += '  • Women Helpline: 181\n';
    chatText += '  • Emergency: 112\n\n';
    chatText += '═══════════════════════════════════════════════════════════════\n';
    chatText += '                    End of Chat History                         \n';
    chatText += '═══════════════════════════════════════════════════════════════\n';
    
    // Create and download file
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Project-Zion-Chat-${new Date().toISOString().slice(0, 10)}-${Date.now()}.txt`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}