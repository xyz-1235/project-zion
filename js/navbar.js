/**
 * Auto-hiding Navbar with Mobile Hamburger Menu
 */

let lastScrollTop = 0;
let navbar;
let mobileMenuToggle;
let mainNav;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    navbar = document.querySelector('.site-header');
    mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    mainNav = document.querySelector('.main-nav');
    
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
    
    // Mobile menu toggle functionality
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navbar.contains(event.target)) {
                closeMobileMenu();
            }
        });
    }
});

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Close mobile menu when scrolling
    if (mainNav && mainNav.classList.contains('active')) {
        closeMobileMenu();
    }
    
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

function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
}

function closeMobileMenu() {
    mobileMenuToggle.classList.remove('active');
    mainNav.classList.remove('active');
}