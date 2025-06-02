// Updated main JavaScript for Jordan Group website
document.addEventListener('DOMContentLoaded', function() {
    // Ensure chat is always visible
    document.body.classList.remove('chat-minimized');
    const topChatInput = document.querySelector('.top-chat-interface .chat-input');
    
    // Toggle sidebar
    const toggleButton = document.querySelector('.toggle-icon button');
    const sidebar = document.querySelector('.sidebar');
    
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
    
    // Just auto-focus chat input when page loads
    // The RAG system in rag.js will handle the actual chat functionality
    if (topChatInput) {
        setTimeout(() => {
            topChatInput.focus();
        }, 1000);
    }
    
    // Make all navigation and content links scroll to top and focus chat
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Extract section name from href
            const section = this.getAttribute('href').replace('#', '');
            const linkText = this.textContent.trim();
            
            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Focus chat input and pre-fill with section query
            setTimeout(function() {
                topChatInput.focus();
                topChatInput.value = `Tell me about ${linkText || section}`;
            }, 800);
            
            // Close sidebar if open
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Handle scroll events for minimalist UI
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');
        
        // Add subtle transparency to header on scroll
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Keep chat always visible - removed auto-hide behavior
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
    
    // Add a minimalist "Ask Jordan Lab" button that appears when scrolled down
    const askButton = document.createElement('button');
    askButton.className = 'ask-button';
    askButton.innerHTML = `
        <span>Ask Jordan Lab</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 15L12 8L19 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    document.body.appendChild(askButton);
    
    // Make the ask button scroll to top and focus chat
    askButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        setTimeout(function() {
            topChatInput.focus();
        }, 800);
    });
    
    // Show/hide ask button based on scroll position
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 600) {
            askButton.classList.add('visible');
        } else {
            askButton.classList.remove('visible');
        }
    });
});
