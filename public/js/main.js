// Shadow Token - Penetration Testing Challenge
console.log("%c⚠️  WELCOME TO SHADOW NETWORK ⚠️", "color: #00ff41; font-size: 16px; font-weight: bold;");
console.log("%cIf you're seeing this, you're already investigating...", "color: #00f0ff; font-size: 12px;");
console.log("");
console.log("%c📍 RECONNAISSANCE GUIDE:", "color: #b026ff; font-size: 12px; font-weight: bold;");
console.log("%c1. Check robots.txt for hidden endpoints\n2. Inspect cookies and localStorage (Application tab)\n3. Look for JWT tokens and decode them\n4. Monitor network requests for exposed credentials\n5. Search HTML source for hidden comments", "color: #94a3b8; font-size: 11px;");
console.log("");
console.log("%c💡 CTF HINTS:", "color: #ffc107; font-size: 12px; font-weight: bold;");
console.log("%cStage 1: Configuration files are often discoverable\nStage 2: Credentials may be encoded in requests\nStage 3: Session tokens reveal structure in browser tools\nStage 4: JWT algorithm field is your target\nStage 5: Chain previous exploits", "color: #94a3b8; font-size: 11px;");
console.log("");
console.log("%c🔍 Pro tip: Use browser DevTools Network tab to inspect all requests/responses", "color: #00f0ff; font-size: 11px; font-style: italic;");

// Check if running in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Display debug info
window.showDebug = function() {
    console.log("%c=== SHADOW TOKEN DEBUG INFO ===", "color: #00ff41; font-weight: bold;");
    
    // Show cookies
    const cookies = document.cookie.split(';');
    console.log("%cCookies found:", "color: #00f0ff; font-weight: bold;");
    cookies.forEach(c => {
        if (c.trim()) {
            console.log("  " + c.trim());
        }
    });
    
    // Show hint
    console.log("%c\n💡 For JWT inspection:", "color: #ffc107; font-weight: bold;");
    console.log("Open DevTools: F12 or Right-click → Inspect");
    console.log("Go to: Application → Cookies → Look for 'session_data' or JWT tokens");
    console.log("Base64 decode: Use an online decoder or Buffer.from(str, 'base64').toString()");
};

console.log("%c\nTip: Type showDebug() to view current session info", "color: #b026ff; font-style: italic;");

