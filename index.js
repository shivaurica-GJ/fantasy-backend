const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const matchRoute = require('./routes/matchRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

// Static files configuration
const flagsPath = path.join(__dirname, 'public/flags');
app.use('/flags', express.static(flagsPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Fallback for missing flags
app.use('/flags', (req, res) => {
  res.sendFile(path.join(flagsPath, 'default.webp'));
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/upcoming-matches', matchRoute);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));