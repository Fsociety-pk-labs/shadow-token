const express = require('express');
const router = express.Router();

// --- System Diagnostics Endpoint ---
router.get('/diagnostic-status', (req, res) => {
    res.render('status', { 
        title: 'System Diagnostics', 
        flag: process.env.FLAG1
    });
});

// --- Employee Portal Login ---
router.get('/login', (req, res) => {
    res.render('login', { title: 'Employee Network Login', error: null, flag: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Expected username/password are stored in frontend JS as a fake "leftover comment"
    if (username === 'admin' && password === 'shadow_admin_2024') {
        const flag2 = process.env.FLAG2;
        res.render('login', { title: 'Network Access Granted', error: null, flag: flag2 });
    } else {
        res.render('login', { title: 'Employee Network Login', error: 'Authentication Failed. Invalid credentials.', flag: null });
    }
});

// --- Session Access Dashboard ---
router.get('/profile', (req, res) => {
    // Set a weak session cookie if it doesn't exist
    if (!req.cookies.session_data) {
        const defaultSession = Buffer.from(JSON.stringify({ user: "guest", access: 0 })).toString('base64');
        res.cookie('session_data', defaultSession, { httpOnly: false }); // httpOnly false so they can see it in devtools
        return res.redirect('/profile');
    }

    try {
        const sessionJson = Buffer.from(req.cookies.session_data, 'base64').toString('ascii');
        const session = JSON.parse(sessionJson);

        if (session.user === 'admin' && session.access === 1) {
            const flag3 = process.env.FLAG3;
            return res.render('profile', { title: 'Administrator Session Access', flag: flag3, session: session });
        } else {
            return res.render('profile', { title: 'Standard User Dashboard', flag: null, session: session });
        }
    } catch (e) {
        return res.render('profile', { title: 'Session Error', flag: null, session: { error: 'Invalid session structure.' } });
    }
});

// --- SSO Token Diagnostic ---
function base64urlEncode(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

router.get('/sso', (req, res) => {
    // Generate a valid "guest" JWT signed with a secret
    const header = { alg: "HS256", typ: "JWT" };
    const payload = { role: "guest" };
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    
    // Fake signature just for the guest token
    const fakeSignature = base64urlEncode("genuine_signature_for_guest");
    const guestJWT = `${encodedHeader}.${encodedPayload}.${fakeSignature}`;

    res.render('sso', { title: 'SSO Token Diagnostics Endpoint', flag: null, jwt: guestJWT, error: null });
});

router.post('/sso', (req, res) => {
    const { token } = req.body;
    
    if (!token) return res.render('sso', { title: 'SSO Token Diagnostics', flag: null, jwt: null, error: 'Token missing.' });

    // Custom vulnerable JWT verification logic
    try {
        const parts = token.split('.');
        if (parts.length < 2) throw new Error("Invalid format");

        const headerStr = Buffer.from(parts[0], 'base64').toString('ascii');
        const payloadStr = Buffer.from(parts[1], 'base64').toString('ascii');
        
        const header = JSON.parse(headerStr);
        const payload = JSON.parse(payloadStr);

        // THE VULNERABILITY: bypasses signature check if alg is 'none'
        if (header.alg !== 'none') {
            // Fake checking for other algorithms
            if (payload.role === 'admin' && parts.length === 3) {
                 return res.render('sso', { title: 'Diagnostics Warning', flag: null, jwt: token, error: 'Verification error: Invalid signature mapping.' });
            }
        }

        if (payload.role === 'admin') {
            const flag4 = process.env.FLAG4;
            return res.render('sso', { title: 'Diagnostics Successful - Admin Detected', flag: flag4, jwt: token, error: null });
        } else {
            return res.render('sso', { title: 'Diagnostics Normal', flag: null, jwt: token, error: 'Token verified successfully. Guest profile loaded.' });
        }
    } catch (err) {
        return res.render('sso', { title: 'Diagnostics Error', flag: null, jwt: token, error: 'Parsing failure.' });
    }
});

// --- Internal Admin Dashboard ---
// Requires the forged token
router.post('/admin', (req, res) => {
    const { token } = req.body;
    
    try {
        const parts = token.split('.');
        if (parts.length < 2) throw new Error("Invalid format");
        
        const headerStr = Buffer.from(parts[0], 'base64').toString('ascii');
        const payloadStr = Buffer.from(parts[1], 'base64').toString('ascii');
        
        const header = JSON.parse(headerStr);
        const payload = JSON.parse(payloadStr);

        if (header.alg === 'none' && payload.role === 'admin') {
            const flag5 = process.env.FLAG5;
            return res.render('admin', { title: 'Executive Control Panel', flag: flag5, error: null });
        } else {
            return res.render('admin', { title: 'Access Denied', flag: null, error: 'Unauthorized profile level.' });
        }
    } catch (e) {
        return res.render('admin', { title: 'Access Denied', flag: null, error: 'Token structure invalid.' });
    }
});

// GET request for admin will just be access denied
router.get('/admin', (req, res) => {
    res.render('admin', { title: 'Access Denied', flag: null, error: 'Direct access to dashboard is restricted. Authentication required.' });
});

module.exports = router;
