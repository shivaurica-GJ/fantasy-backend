const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); // No `.js` extension
const matchRoute = require('./routes/matchRoutes'); // No `.js` extension

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

app.use('/flags', express.static('public/flags'));

app.use('/api/users', userRoutes);
app.use('/api/upcoming-matches', matchRoute);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));