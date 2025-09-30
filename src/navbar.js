/**
 * Auto-hiding Navbar Implementation
 * Hides navbar when scrolling down, shows when scrolling up
 */

class AutoHideNavbar {
    constructor() {
        this.navbar = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 10;
        this.isHidden = false;
        
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
        
        // Ignore small scroll movements
        if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) {
            return;
        }
        
        // At the top of the page, always show navbar
        if (scrollTop <= this.scrollThreshold) {
            this.showNavbar();
        }
        // Scrolling down
        else if (scrollTop > this.lastScrollTop && !this.isHidden) {
            this.hideNavbar();
        }
        // Scrolling up
        else if (scrollTop < this.lastScrollTop && this.isHidden) {
            this.showNavbar();
        }
        
        this.lastScrollTop = scrollTop;
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