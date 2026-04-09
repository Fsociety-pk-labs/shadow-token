const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Shadow IT Solutions | Enterprise Cloud Integration' });
});

module.exports = router;
