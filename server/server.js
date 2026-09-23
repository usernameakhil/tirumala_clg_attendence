const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const studentRoutes = require('./routes/student');
const managementRoutes = require('./routes/management');
const { seedDatabase } = require('./seeds/seedData');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_tracker';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/student', studentRoutes);
// Management layer - completely separate protected route
app.use('/api/management', managementRoutes);

// Render Keep-Alive ping
app.get(['/ping', '/api/ping'], (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'Backend is active',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Static files (serve built React client in production if available)
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log(`📁 Serving frontend static files from: ${clientDistPath}`);
}

// Root API response (if not serving client HTML)
app.get('/api', (req, res) => {
  res.status(200).json({
    service: 'Attendance Tracker API',
    status: 'online'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Reset demo data
app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset with fresh sample data!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Client SPA fallback: for any non-API route, send index.html if dist exists
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Connect MongoDB and start
let targetUri = MONGODB_URI;
if (MONGODB_URI.includes('<db_password>')) {
  console.warn('\n⚠️  "<db_password>" detected. Falling back to local MongoDB.\n');
  targetUri = 'mongodb://127.0.0.1:27017/attendance_tracker';
}

const sanitizedUri = targetUri.replace(/:([^@]+)@/, ':****@');

function startKeepAlive() {
  const serviceUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  if (!serviceUrl) {
    console.log('ℹ️  Keep-Alive: Set RENDER_EXTERNAL_URL on Render to activate auto-ping.');
    return;
  }
  const pingUrl = `${serviceUrl.replace(/\/$/, '')}/ping`;
  console.log(`⏰ Keep-Alive active — pinging ${pingUrl} every 14 minutes.`);
  setInterval(async () => {
    try {
      const res = await fetch(pingUrl);
      console.log(`[${new Date().toLocaleTimeString()}] 💓 Keep-Alive OK (${res.status})`);
    } catch (err) {
      console.warn(`[Keep-Alive] Ping failed: ${err.message}`);
    }
  }, 14 * 60 * 1000);
}

mongoose
  .connect(targetUri)
  .then(async () => {
    console.log(` Connected to MongoDB at ${sanitizedUri}`);
    await seedDatabase(false);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startKeepAlive();
    });
  })
  .catch((err) => {
    console.error('\n❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('👉 Check the database password in server/.env');
    }
    process.exit(1);
  });
