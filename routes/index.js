const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Omnivore Corp | Global Cyber Infrastructure' });
});

// Easter egg endpoint - discoverable through recon
router.get('/api/status', (req, res) => {
    res.json({
        status: 'operational',
        version: '2.1.0',
        uptime: Math.floor(Math.random() * 1000000),
        services: [
            { name: 'auth-service', status: 'healthy', endpoint: '/login' },
            { name: 'session-service', status: 'healthy', endpoint: '/profile' },
            { name: 'sso-gateway', status: 'healthy', endpoint: '/sso' },
            { name: 'diagnostic-service', status: 'require_auth', endpoint: '/diagnostic-status' },
            { name: 'admin-panel', status: 'restricted', endpoint: '/admin' }
        ],
        hint: 'All services are monitored. Choose your endpoint wisely.'
    });
});

module.exports = router;
