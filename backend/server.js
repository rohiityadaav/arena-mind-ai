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

// Routes
app.use('/api/stadium', stadiumRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/chat', chatRouter);

// Basic health check
app.get('/api/health', (req, res) => {
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
