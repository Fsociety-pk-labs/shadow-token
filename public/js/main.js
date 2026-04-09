// Shadow IT Solutions - Client-side utilities
console.log("%cShadow IT Solutions", "color: #3b82f6; font-size: 14px; font-weight: bold;");
console.log("%cEnterprise Infrastructure & Cloud Platform", "color: #6b7280; font-size: 12px;");
console.log("%cFor support, contact: info@shadowit.solutions", "color: #9ca3af; font-size: 11px;");

// Check if running in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Display debug info
window.showDebug = function() {
    console.log("%c=== SESSION DEBUG INFO ===", "color: #3b82f6; font-weight: bold;");
    
    // Show cookies
    const cookies = document.cookie.split(';');
    console.log("%cCookies found:", "color: #0ea5e9; font-weight: bold;");
    cookies.forEach(c => {
        if (c.trim()) {
            console.log("  " + c.trim());
        }
    });
    
    // Show hint
    console.log("%c\nFor API inspection:", "color: #d97706; font-weight: bold;");
    console.log("Open Browser DevTools: F12 or Right-click → Inspect");
    console.log("Go to: Network tab to monitor API calls");
    console.log("Or: Application tab → Cookies to view session data");
};

