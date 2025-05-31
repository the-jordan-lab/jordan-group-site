// Updated main JavaScript for Jordan Lab website

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile - overlay without shifting content
    const toggleButton = document.querySelector('.toggle-icon button');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(event.target) && 
                !toggleButton.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Minimalist chat button that appears on scroll
    const minimalistChatButton = document.querySelector('.minimalist-chat-button');
    const minimalistChatInterface = document.querySelector('.minimalist-chat-interface');
    const topChatInput = document.querySelector('.top-chat-interface .chat-input');
    
    // Show minimalist chat button when scrolling down
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Show button when scrolling down past the top chat interface
        if (scrollTop > 400) {
            minimalistChatButton.classList.add('visible');
        } else {
            minimalistChatButton.classList.remove('visible');
            // Also close the chat interface if it's open
            if (minimalistChatInterface.classList.contains('active')) {
                minimalistChatInterface.classList.remove('active');
                minimalistChatButton.querySelector('.arrow-icon').textContent = '↑';
            }
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Toggle minimalist chat interface
    if (minimalistChatButton && minimalistChatInterface) {
        minimalistChatButton.addEventListener('click', function() {
            minimalistChatInterface.classList.toggle('active');
            
            // Change arrow direction
            const arrowIcon = minimalistChatButton.querySelector('.arrow-icon');
            if (minimalistChatInterface.classList.contains('active')) {
                arrowIcon.textContent = '↓';
            } else {
                arrowIcon.textContent = '↑';
            }
        });
    }
    
    // Handle chat input in top interface
    if (topChatInput) {
        topChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && topChatInput.value.trim() !== '') {
                handleUserQuery(topChatInput.value.trim());
                topChatInput.value = '';
            }
        });
    }
    
    // Handle chat action buttons in top interface
    const topChatActionButtons = document.querySelectorAll('.top-chat-interface .chat-action-button');
    if (topChatActionButtons) {
        topChatActionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const query = `Tell me about ${button.textContent}`;
                topChatInput.value = query;
                handleUserQuery(query);
                topChatInput.value = '';
            });
        });
    }
    
    // Function to handle user queries (shared between both chat interfaces)
    function handleUserQuery(query) {
        console.log('Query received:', query);
        // This would be replaced with actual RAG functionality
        // For now, just log the query
        
        // Show a response in a modal or alert for demonstration
        alert(`Your query: "${query}" would be processed by the RAG system, retrieving information from the lab's knowledge base.`);
    }
    
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add gradient animations for cards
    const cards = document.querySelectorAll('.card-image');
    cards.forEach(card => {
        if (card.classList.contains('gradient-1') || 
            card.classList.contains('gradient-2') || 
            card.classList.contains('gradient-3') || 
            card.classList.contains('gradient-4') || 
            card.classList.contains('gradient-5') || 
            card.classList.contains('gradient-6')) {
            
            // Add subtle animation to gradients
            card.style.backgroundSize = '200% 200%';
            card.style.animation = 'gradient-animation 15s ease infinite';
        }
    });
    
    // Add CSS for gradient animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(style);
});
