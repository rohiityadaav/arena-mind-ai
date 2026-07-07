require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const stadiumRouter = require('./routes/stadium');
const alertsRouter = require('./routes/alerts');
const feedbackRouter = require('./routes/feedback');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Enable preflight handling globally

app.use(express.json());

// Request logger for debugging deployment CORS / 404 issues
app.use((req, res, next) => {
  console.log(`[DEPLOY_DEBUG] Incoming: ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'No-Origin'}`);
  next();
});

// Routes
console.log('[DEPLOY_DEBUG] Mounting Express API routes...');
app.use('/api/stadium', stadiumRouter);
console.log('[DEPLOY_DEBUG] Mounted: /api/stadium');
app.use('/api/alerts', alertsRouter);
console.log('[DEPLOY_DEBUG] Mounted: /api/alerts');
app.use('/api/feedback', feedbackRouter);
console.log('[DEPLOY_DEBUG] Mounted: /api/feedback');
app.use('/api/chat', chatRouter);
console.log('[DEPLOY_DEBUG] Mounted: /api/chat');

// Basic health check
app.get('/api/health', (req, res) => {
  console.log('[DEPLOY_DEBUG] /api/health check executed.');
  res.json({ status: 'ok' });
});

// Serve frontend in production (if build folder exists)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res, next) => {
  // If request is API, pass through
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      // In dev, frontend won't have a dist folder yet
      res.status(200).send('ArenaMind-AI API Server is running. Start Vite client for UI.');
    }
  });
});

// Initialize database then start server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`ArenaMind-AI Backend listening on port ${PORT}`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
