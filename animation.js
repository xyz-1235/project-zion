// Matrix-style Cybercrime Symbol Rain Animation
// Add this to your existing ProjectZionAI code or as a separate file

class CyberMatrixRain {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.columns = [];
        this.fontSize = 16;
        this.animationId = null;
        
        // Cybercrime and cyberbullying related symbols
        this.symbols = [
            '⚠️', '🔒', '🔓', '👁️', '⛔', '🚫', '💀', '⚡', 
            '📱', '💻', '🕷️', '🐛', '⚔️', '🔪', '💣', '🎭',
            'SCAM', 'HACK', 'SPAM', 'TRAP', 'FAKE', 'BAIT',
            '👤', '🎯', '⚡', '🔐', '🛡️', '❌', '🔴', '⭕',
            // Matrix-style characters
            'ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ', 'ｼ', 'ﾅ', 'ﾓ', 'ﾆ', 'ｻ', 'ﾜ', 'ﾂ', 'ｵ', 'ﾘ', 'ｱ', 'ﾎ', 'ﾃ', 'ﾏ', 'ｹ', 'ﾒ', 'ｴ', 'ｶ', 'ｷ', 'ﾑ', 'ﾕ', 'ﾗ', 'ｾ', 'ﾈ', 'ｽ', 'ﾀ', 'ﾇ', 'ﾍ',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'Z'
        ];
        
        this.init();
    }

    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'matrix-background';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: 0.15;
        `;
        
        // Insert canvas as first child of body
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Setup event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start animation
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate number of columns
        const numColumns = Math.floor(this.canvas.width / this.fontSize);
        
        // Initialize columns array with random positions
        this.columns = [];
        for (let i = 0; i < numColumns; i++) {
            this.columns.push({
                y: Math.random() * this.canvas.height * -1, // Start above screen
                speed: Math.random() * 2 + 1, // Random speed between 1-3
                symbolIndex: Math.floor(Math.random() * this.symbols.length),
                brightness: Math.random() * 0.5 + 0.5, // Random brightness 0.5-1
                changeCounter: 0,
                changeRate: Math.floor(Math.random() * 30) + 10 // Change symbol every 10-40 frames
            });
        }
    }

    animate() {
        // Create trailing effect with semi-transparent black
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        
        // Update and draw each column
        this.columns.forEach((column, index) => {
            // Get current symbol
            const symbol = this.symbols[column.symbolIndex];
            
            // Calculate position
            const x = index * this.fontSize;
            const y = column.y;
            
            // Create green gradient color (Matrix style)
            const green = Math.floor(column.brightness * 255);
            this.ctx.fillStyle = `rgb(0, ${green}, 0)`;
            
            // Highlight the leading character
            if (Math.random() > 0.95) {
                this.ctx.fillStyle = `rgb(200, 255, 200)`;
            }
            
            // Draw symbol
            this.ctx.fillText(symbol, x, y);
            
            // Update position
            column.y += column.speed;
            
            // Reset column when it goes off screen
            if (column.y > this.canvas.height) {
                column.y = Math.random() * -100;
                column.speed = Math.random() * 2 + 1;
                column.brightness = Math.random() * 0.5 + 0.5;
            }
            
            // Change symbol periodically
            column.changeCounter++;
            if (column.changeCounter >= column.changeRate) {
                column.symbolIndex = Math.floor(Math.random() * this.symbols.length);
                column.changeCounter = 0;
                column.changeRate = Math.floor(Math.random() * 30) + 10;
            }
        });
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Method to pause animation (for performance)
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Method to resume animation
    resume() {
        if (!this.animationId) {
            this.animate();
        }
    }

    // Method to destroy animation
    destroy() {
        this.pause();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}

// Initialize Matrix Rain when page loads
let matrixRain;
document.addEventListener('DOMContentLoaded', () => {
    // Start Matrix Rain animation
    matrixRain = new CyberMatrixRain();
    
    // Pause animation when user is inactive (performance optimization)
    let inactivityTimer;
    document.addEventListener('mousemove', () => {
        if (matrixRain) matrixRain.resume();
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            // Pause after 5 minutes of inactivity
            if (matrixRain) matrixRain.pause();
        }, 300000);
    });
});
