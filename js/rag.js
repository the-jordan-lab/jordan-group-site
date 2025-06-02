// RAG integration for lab website
// This file handles the RAG (Retrieval Augmented Generation) functionality
// connecting the chat interface to the backend API

document.addEventListener('DOMContentLoaded', function() {
    // Chat interface elements
    const chatInterface = document.querySelector('.chatgpt-interface');
    const chatHistory = document.querySelector('.chat-history');
    const chatInput = document.querySelector('.chat-input');
    const chatActionButtons = document.querySelectorAll('.chat-action-button');
    const sendButton = document.querySelector('.send-button');
    const suggestedTopics = document.querySelector('.suggested-topics');
    const chatInputArea = document.querySelector('.chat-input-area');
    
    // API configuration
    const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
    
    // Generate a unique session ID for this conversation
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Handle chat input submission
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && chatInput.value.trim() !== '') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Handle send button
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            handleUserQuery(message);
            chatInput.value = '';
            // Hide suggested topics once conversation starts
            chatInputArea.classList.add('has-messages');
        }
    }
    
    // Handle chat action buttons
    if (chatActionButtons) {
        chatActionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const query = button.querySelector('span').textContent;
                handleUserQuery(query);
                // Hide suggested topics once conversation starts
                chatInputArea.classList.add('has-messages');
            });
        });
    }
    
    // Function to handle user queries
    async function handleUserQuery(query) {
        // Add user message to chat history
        addMessageToChat('user', query);
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Call real RAG API
            const response = await callRagAPI(query);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            if (response.success) {
                // Add bot response to chat history
                addMessageToChat('bot', response.answer, response.sources);
            } else {
                // Handle error response
                addMessageToChat('bot', response.answer || 'Sorry, I encountered an error. Please try again.', []);
            }
            
        } catch (error) {
            console.error('Error calling RAG API:', error);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add error message
            addMessageToChat('bot', 'I\'m having trouble connecting to my knowledge base right now. Please try again in a moment, or contact the lab directly for assistance.', []);
        }
        
        // Scroll to bottom of chat history
        scrollChatToBottom();
    }
    
    // Function to call the RAG API
    async function callRagAPI(query) {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                query: query,
                sessionId: sessionId 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Function to add message to chat history
    function addMessageToChat(type, text, sources = null) {
        // Hide welcome message when first message is added
        const welcomeMessage = chatHistory.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'chat-message-content';
        
        let contentHTML = `<p>${text}</p>`;
        
        // Add sources if available (only for bot messages)
        if (type === 'bot' && sources && sources.length > 0) {
            contentHTML += `
                <div class="sources" style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">📚 Sources:</p>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${sources.map(source => `
                            <li style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 4px;">
                                • ${source.title}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        messageContent.innerHTML = contentHTML;
        messageElement.appendChild(messageContent);
        chatHistory.appendChild(messageElement);
        
        // Scroll to bottom of chat history
        scrollChatToBottom();
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message bot typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p><small>Searching knowledge base...</small></p>
        `;
        chatHistory.appendChild(typingIndicator);
        scrollChatToBottom();
    }
    
    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = chatHistory.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to scroll chat to bottom
    function scrollChatToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // Health check on page load
    async function checkAPIHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            const health = await response.json();
            
            console.log('RAG API Health:', health);
            
            if (!health.services.notion || !health.services.openai) {
                console.warn('Some RAG services are not properly configured');
            }
        } catch (error) {
            console.warn('RAG API is not available:', error);
        }
    }
    
    // Check API health on load
    checkAPIHealth();
    
    // Add enhanced CSS for typing indicator and sources
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 10px 0;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.6);
            animation: typing-animation 1.4s infinite ease-in-out both;
        }
        
        .typing-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes typing-animation {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        .sources {
            margin-top: 15px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            border-left: 4px solid rgba(255, 255, 255, 0.3);
        }
        
        .sources h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .sources ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .sources li {
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.4;
        }
        
        .sources li strong {
            color: rgba(255, 255, 255, 0.95);
        }
        
        .sources li small {
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
        }
        
        .chat-message.bot {
            animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .typing-indicator {
            opacity: 0.8;
        }
        
        .typing-indicator p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
        }
    `;
    document.head.appendChild(style);
});
