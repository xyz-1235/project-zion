/**
 * Simple Auto-hiding Navbar with Rounded Corners
 */

let lastScrollTop = 0;
let navbar;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    navbar = document.querySelector('.site-header');
    
    if (navbar) {
        // Add scroll listener with throttling for better performance
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
});

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show navbar at top of page
    if (scrollTop <= 50) {
        navbar.classList.remove('hidden');
    }
    // Hide when scrolling down, show when scrolling up
    else if (scrollTop > 100) {
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
    }
    
    lastScrollTop = scrollTop;
}