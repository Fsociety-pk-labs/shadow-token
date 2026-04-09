const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Robots.txt for Stage 1
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /diagnostic-status\nDisallow: /admin");
});

// Routes
const indexRoutes = require('./routes/index');
const stagesRoutes = require('./routes/stages');

app.use('/', indexRoutes);
app.use('/', stagesRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Not Found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Shadow Token server running on http://localhost:${PORT}`);
});
