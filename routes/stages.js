const express = require('express');
const router = express.Router();

// --- System Diagnostics Endpoint ---
// Vulnerability: Information Disclosure via hidden endpoint
// Users must find this via /robots.txt or discover through recon
router.get('/diagnostic-status', (req, res) => {
    // Only show flag if they found the secret validation token
    const hasValidToken = req.query.auth === Buffer.from('shadow_audit_token_2024').toString('base64');
    
    const systemStatus = {
        status: 'operational',
        uptime: '127.4 hours',
        database: 'connected',
        cache: 'synchronized',
        last_audit: '2024-01-15T09:32:00Z',
        security_patch: 'applied'
    };
    
    res.render('status', { 
        title: 'System Diagnostics', 
        flag: hasValidToken ? process.env.FLAG1 : null,
        systemStatus: systemStatus
    });
});

// --- Employee Portal Login ---
// Vulnerability: Credentials exposure + weak validation
router.get('/login', (req, res) => {
    res.render('login', { title: 'Employee Network Login', error: null, flag: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Credentials are hardcoded but not obvious - users need to find via:
    // 1. Inspecting network requests
    // 2. Checking headers
    // 3. Decoding frontend logic
    const validAdminHash = Buffer.from('admin:P@ssw0rd_2024!').toString('base64');
    const submittedHash = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Check if submitted matches valid hash
    if (submittedHash === validAdminHash) {
        const flag2 = process.env.FLAG2;
        res.render('login', { title: 'Network Access Granted', error: null, flag: flag2 });
    } else {
        res.render('login', { title: 'Employee Network Login', error: 'Authentication Failed. Invalid credentials.', flag: null });
    }
});

// --- Session Access Dashboard ---
// Vulnerability: Weak cryptography (Base64 is not encryption!)
// Users must: decode Base64 → modify JSON → re-encode
router.get('/profile', (req, res) => {
    // Set a weak session cookie if it doesn't exist
    if (!req.cookies.session_data) {
        const defaultSession = Buffer.from(JSON.stringify({ user: "guest", access: 0, timestamp: Date.now() })).toString('base64');
        res.cookie('session_data', defaultSession, { httpOnly: false, maxAge: 24 * 60 * 60 * 1000 });
        return res.redirect('/profile');
    }

    try {
        const sessionJson = Buffer.from(req.cookies.session_data, 'base64').toString('ascii');
        const session = JSON.parse(sessionJson);

        // Require both admin status AND recent timestamp (within last hour for demo)
        const isRecent = (Date.now() - session.timestamp) < (60 * 60 * 1000);
        
        if (session.user === 'admin' && session.access === 1 && isRecent) {
            const flag3 = process.env.FLAG3;
            return res.render('profile', { 
                title: 'Administrator Session Access', 
                flag: flag3, 
                session: session,
                warning: null 
            });
        } else if (session.user === 'admin' && session.access === 1 && !isRecent) {
            return res.render('profile', { 
                title: 'Session Expired', 
                flag: null, 
                session: session,
                warning: 'Your session has expired. Please update the timestamp.' 
            });
        } else {
            return res.render('profile', { 
                title: 'Standard User Dashboard', 
                flag: null, 
                session: session,
                warning: null 
            });
        }
    } catch (e) {
        return res.render('profile', { 
            title: 'Session Error', 
            flag: null, 
            session: { error: 'Invalid session structure.' },
            warning: 'Session corrupted.' 
        });
    }
});

// --- SSO Token Diagnostic ---
// CVE-2015-9235: JWT alg:none bypass vulnerability
const SECRET = process.env.SECRET || 'super_secret_key_2024';
const crypto = require('crypto');

function base64urlEncode(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return Buffer.from(base64, 'base64').toString();
}

function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const header = JSON.parse(base64urlDecode(parts[0]));
        const payload = JSON.parse(base64urlDecode(parts[1]));
        const signature = parts[2];
        
        // VULNERABLE: if alg is 'none', skip signature verification
        if (header.alg === 'none') {
            return { valid: true, header, payload };
        }
        
        // For other algorithms, verify (but this is the exploit vector)
        if (header.alg === 'HS256') {
            const message = `${parts[0]}.${parts[1]}`;
            const hash = crypto.createHmac('sha256', secret)
                .update(message)
                .digest('base64url');
            
            if (hash === signature) {
                return { valid: true, header, payload };
            }
        }
        
        return { valid: false };
    } catch (e) {
        return { valid: false };
    }
}

router.get('/sso', (req, res) => {
    // Generate a valid "guest" JWT with HS256
    const header = { alg: "HS256", typ: "JWT" };
    const payload = { role: "guest", iat: Math.floor(Date.now() / 1000) };
    
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', SECRET)
        .update(message)
        .digest('base64url');
    
    const guestJWT = `${message}.${signature}`;

    res.render('sso', { 
        title: 'SSO Token Diagnostics Endpoint', 
        flag: null, 
        jwt: guestJWT, 
        error: null,
        info: 'Submit your JWT token for verification'
    });
});

router.post('/sso', (req, res) => {
    const { token } = req.body;
    
    if (!token) return res.render('sso', { 
        title: 'SSO Token Diagnostics', 
        flag: null, 
        jwt: null, 
        error: 'Token missing.',
        info: null 
    });

    try {
        const result = verifyJWT(token, SECRET);
        
        if (!result.valid && !result.header) {
            return res.render('sso', { 
                title: 'Token Parse Error', 
                flag: null, 
                jwt: token, 
                error: 'Failed to parse token structure.',
                info: null 
            });
        }

        // Check if they exploited the alg:none bypass
        if (result.header && result.header.alg === 'none' && result.payload && result.payload.role === 'admin') {
            const flag4 = process.env.FLAG4;
            return res.render('sso', { 
                title: 'CRITICAL: Algorithm None Bypass Detected!', 
                flag: flag4, 
                jwt: token, 
                error: null,
                info: 'CVE-2015-9235 vulnerability exploited successfully!'
            });
        }

        if (result.valid && result.payload.role === 'admin') {
            return res.render('sso', { 
                title: 'Valid Admin Token', 
                flag: null, 
                jwt: token, 
                error: 'Token verified with valid signature, but role mismatch.',
                info: 'Only alg:none bypass will grant access.'
            });
        }

        return res.render('sso', { 
            title: 'Diagnostics Normal', 
            flag: null, 
            jwt: token, 
            error: null,
            info: `Verified as: ${result.payload ? result.payload.role : 'unknown'} Access Level: Read-Only`
        });

    } catch (err) {
        return res.render('sso', { 
            title: 'Diagnostics Error', 
            flag: null, 
            jwt: token, 
            error: 'Token validation error: ' + err.message,
            info: null 
        });
    }
});

// --- Internal Admin Dashboard ---
// Final stage: Requires successful JWT exploitation from Stage 4
router.post('/admin', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.render('admin', { 
            title: 'Access Denied', 
            flag: null, 
            error: 'No authentication token provided.',
            authenticated: false 
        });
    }
    
    try {
        const result = verifyJWT(token, SECRET);
        
        if (!result || !result.header) {
            throw new Error("Invalid token format");
        }

        // MUST use alg:none AND have admin role (exploiting CVE-2015-9235)
        if (result.header.alg === 'none' && result.payload && result.payload.role === 'admin') {
            const flag5 = process.env.FLAG5;
            return res.render('admin', { 
                title: 'Executive Control Panel - System Compromised', 
                flag: flag5, 
                error: null,
                authenticated: true,
                userRole: 'admin'
            });
        } else {
            return res.render('admin', { 
                title: 'Access Denied', 
                flag: null, 
                error: `Unauthorized access attempt. Role: ${result.payload ? result.payload.role : 'unknown'}`,
                authenticated: false 
            });
        }
    } catch (e) {
        return res.render('admin', { 
            title: 'Access Denied', 
            flag: null, 
            error: 'Authentication failed: ' + e.message,
            authenticated: false 
        });
    }
});

// GET request for admin will just be access denied
router.get('/admin', (req, res) => {
    res.render('admin', { 
        title: 'Access Denied', 
        flag: null, 
        error: 'Direct access to dashboard is restricted. You must authenticate with a valid token.',
        authenticated: false 
    });
});

module.exports = router;
