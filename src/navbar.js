/**
 * Auto-hiding Navbar Implementation
 * Hides navbar when scrolling down, shows when scrolling up
 */

class AutoHideNavbar {
    constructor() {
        this.navbar = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 5; // Reduced for more responsiveness
        this.isHidden = false;
        this.scrollVelocity = 0;
        this.lastScrollTime = 0;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.navbar = document.querySelector('.site-header');
        
        if (!this.navbar) {
            console.warn('AutoHideNavbar: .site-header not found');
            return;
        }
        
        // Add scroll listener with throttling
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Show navbar on hover when hidden
        this.navbar.addEventListener('mouseenter', () => {
            if (this.isHidden) {
                this.showNavbar();
            }
        });
        
        // Hide navbar again after leaving (if scrolled down)
        this.navbar.addEventListener('mouseleave', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > this.scrollThreshold) {
                this.hideNavbar();
            }
        });
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentTime = Date.now();
        
        // Calculate scroll velocity
        const timeDiff = currentTime - this.lastScrollTime;
        const scrollDiff = Math.abs(scrollTop - this.lastScrollTop);
        this.scrollVelocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
        
        // Adjust transition speed based on scroll velocity
        const baseTransition = 0.3;
        const velocityFactor = Math.min(this.scrollVelocity * 0.1, 0.5);
        const transitionSpeed = Math.max(baseTransition - velocityFactor, 0.1);
        
        this.navbar.style.transition = `transform ${transitionSpeed}s ease, opacity ${transitionSpeed}s ease`;
        
        // Ignore very small scroll movements
        if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) {
            this.lastScrollTime = currentTime;
            return;
        }
        
        // At the top of the page, always show navbar
        if (scrollTop <= this.scrollThreshold) {
            this.showNavbar();
        }
        // Scrolling down with some velocity
        else if (scrollTop > this.lastScrollTop && !this.isHidden && this.scrollVelocity > 0.1) {
            this.hideNavbar();
        }
        // Scrolling up
        else if (scrollTop < this.lastScrollTop && this.isHidden) {
            this.showNavbar();
        }
        
        this.lastScrollTop = scrollTop;
        this.lastScrollTime = currentTime;
    }
    
    hideNavbar() {
        if (this.navbar && !this.isHidden) {
            this.navbar.classList.add('hidden');
            this.isHidden = true;
            
            // Add top padding to body to prevent jump
            if (!document.body.style.paddingTop) {
                document.body.style.paddingTop = this.navbar.offsetHeight + 'px';
            }
        }
    }
    
    showNavbar() {
        if (this.navbar && this.isHidden) {
            this.navbar.classList.remove('hidden');
            this.isHidden = false;
            
            // Remove top padding from body
            document.body.style.paddingTop = '';
        }
    }
    
    // Method to force show navbar (useful for debugging)
    forceShow() {
        this.showNavbar();
    }
    
    // Method to force hide navbar
    forceHide() {
        this.hideNavbar();
    }
}

// Initialize auto-hiding navbar
let autoHideNavbar;

document.addEventListener('DOMContentLoaded', () => {
    autoHideNavbar = new AutoHideNavbar();
});

// Make it available globally
window.AutoHideNavbar = AutoHideNavbar;
window.autoHideNavbar = autoHideNavbar;