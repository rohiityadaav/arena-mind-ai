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

// Security Headers to prevent clickjacking, MIME sniffing, and XSS injection vectors
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS
app.use(cors({
  origin: '*', // allow Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // preflight

// JSON body parsing
app.use(express.json());

// Logging middleware before routes
app.use((req, res, next) => {
  console.log('[DEPLOY_DEBUG] Incoming request:', req.method, req.url);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
console.log('[DEPLOY_DEBUG] Mounting /api/stadium, /api/alerts, /api/chat routes...');
app.use('/api/stadium', stadiumRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/chat', chatRouter);

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
      console.log('[DEPLOY_DEBUG] Server running on port', PORT);
    });
  } catch (err) {
    console.error('[DEPLOY_DEBUG] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
