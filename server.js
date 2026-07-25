require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cymor Python Learner running on port ${PORT}`));
