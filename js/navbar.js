/**
 * Simple Auto-hiding Navbar
 */

let lastScrollTop = 0;
const navbar = document.querySelector('.site-header');

if (navbar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}