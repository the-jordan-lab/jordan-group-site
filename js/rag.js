// RAG integration for lab website
// This file handles the RAG (Retrieval Augmented Generation) functionality
// connecting the chat interface to knowledge sources

document.addEventListener('DOMContentLoaded', function() {
    // Chat interface elements
    const chatInterface = document.querySelector('.chat-interface');
    const chatHistory = document.querySelector('.chat-history');
    const chatInput = document.querySelector('.chat-input');
    const chatActionButtons = document.querySelectorAll('.chat-action-button');
    
    // Initialize chat history if empty
    if (chatHistory && chatHistory.innerHTML.trim() === '') {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'chat-message bot';
        welcomeMessage.innerHTML = `
            <p>Welcome to the James M. Jordan Laboratory assistant. I can help you find information about our research, 
            publications, team members, methods, and resources. What would you like to know?</p>
        `;
        chatHistory.appendChild(welcomeMessage);
    }
    
    // Handle chat input submission
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && chatInput.value.trim() !== '') {
                handleUserQuery(chatInput.value.trim());
                chatInput.value = '';
            }
        });
    }
    
    // Handle chat action buttons
    if (chatActionButtons) {
        chatActionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const query = `Tell me about ${button.textContent}`;
                chatInput.value = query;
                handleUserQuery(query);
                chatInput.value = '';
            });
        });
    }
    
    // Function to handle user queries
    function handleUserQuery(query) {
        // Add user message to chat history
        addMessageToChat('user', query);
        
        // Show typing indicator
        showTypingIndicator();
        
        // Call RAG service (mock for now)
        setTimeout(() => {
            // Remove typing indicator
            removeTypingIndicator();
            
            // Get response from RAG
            const response = mockRagResponse(query);
            
            // Add bot response to chat history
            addMessageToChat('bot', response.answer, response.sources);
            
            // Scroll to bottom of chat history
            scrollChatToBottom();
        }, 1500); // Simulate processing time
    }
    
    // Function to add message to chat history
    function addMessageToChat(type, text, sources = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        let messageContent = `<p>${text}</p>`;
        
        // Add sources if available
        if (sources && sources.length > 0) {
            messageContent += `
                <div class="sources">
                    <h4>Sources:</h4>
                    <ul>
                        ${sources.map(source => `<li>${source.title}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        messageElement.innerHTML = messageContent;
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
    
    // Mock RAG response function - this would be replaced with actual API calls
    function mockRagResponse(query) {
        query = query.toLowerCase();
        
        // Default response
        let answer = "I don't have specific information about that in my knowledge base. Can you try asking about our research areas, publications, team members, or laboratory resources?";
        let sources = [];
        
        // Research-related queries
        if (query.includes('research') || query.includes('study') || query.includes('project')) {
            answer = "The Jordan Laboratory focuses on three main research areas: (1) Molecular Mechanisms of Cellular Adaptation, where we study how cells respond to environmental changes at the molecular level; (2) Evolutionary Dynamics in Microbial Communities, investigating how microbial populations evolve over time; and (3) Novel Methodologies for Biological Applications, developing new techniques for biological research.";
            sources = [
                { title: "Research Areas - Jordan Lab Website", url: "#" },
                { title: "Genomic signatures of adaptation in response to environmental stressors (2025)", url: "#" }
            ];
        }
        
        // Publication-related queries
        else if (query.includes('publication') || query.includes('paper') || query.includes('journal')) {
            answer = "Our lab has published several significant papers in recent years. Our most recent publication is 'Genomic signatures of adaptation in response to environmental stressors' in the Journal of Molecular Biology (2025). Another notable publication is 'Computational framework for predicting evolutionary trajectories in microbial communities' in Bioinformatics (2024).";
            sources = [
                { title: "Publications - Jordan Lab Website", url: "#" },
                { title: "Journal of Molecular Biology (2025), 42(3): 156-172", url: "#" }
            ];
        }
        
        // Team-related queries
        else if (query.includes('team') || query.includes('member') || query.includes('people') || query.includes('staff')) {
            answer = "The Jordan Laboratory team is led by Dr. James M. Jordan (Principal Investigator) and includes Dr. Amanda Chen (Research Scientist), Michael Rodriguez (Ph.D. Candidate), and Sarah Johnson (Lab Manager), among others. Our team has expertise in molecular biology, computational biology, and evolutionary dynamics.";
            sources = [
                { title: "Team Members - Jordan Lab Website", url: "#" },
                { title: "Dr. James M. Jordan - Faculty Profile", url: "#" }
            ];
        }
        
        // Methods-related queries
        else if (query.includes('method') || query.includes('technique') || query.includes('protocol')) {
            answer = "Our laboratory employs a variety of cutting-edge methods including next-generation sequencing, computational modeling, and advanced microscopy techniques. We have developed several novel methodologies for analyzing genomic data and tracking evolutionary changes in microbial populations.";
            sources = [
                { title: "Methods & Resources - Jordan Lab Website", url: "#" },
                { title: "Novel Methodologies for Biological Applications - Research Area", url: "#" }
            ];
        }
        
        // Resources-related queries
        else if (query.includes('resource') || query.includes('equipment') || query.includes('facility')) {
            answer = "The Jordan Laboratory is equipped with state-of-the-art facilities for molecular biology, genomics, and computational analysis. Our resources include next-generation sequencing platforms, high-performance computing clusters, specialized software packages, and custom algorithms for data analysis.";
            sources = [
                { title: "Laboratory Resources - Jordan Lab Website", url: "#" },
                { title: "Equipment Specifications and Usage Guides", url: "#" }
            ];
        }
        
        // Contact-related queries
        else if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('location')) {
            answer = "The James M. Jordan Laboratory is located in the Biology Building, Room 4023, at Florida State University. You can contact Dr. Jordan by email at jjordan@fsu.edu or by phone at (850) 123-4567. The lab's mailing address is 319 Stadium Drive, Tallahassee, FL 32306.";
            sources = [
                { title: "Contact Information - Jordan Lab Website", url: "#" }
            ];
        }
        
        return {
            answer: answer,
            sources: sources
        };
    }
    
    // Add CSS for typing indicator
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 10px;
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
    `;
    document.head.appendChild(style);
});
