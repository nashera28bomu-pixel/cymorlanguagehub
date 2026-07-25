const express = require('express');
const Progress = require('../models/Progress');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Get all progress for logged-in user
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load progress', details: err.message });
  }
});

// Mark practice exercise complete
router.post('/practice/:lessonNumber', async (req, res) => {
  try {
    const lessonNumber = Number(req.params.lessonNumber);
    const updated = await Progress.findOneAndUpdate(
      { userId: req.userId, lessonNumber },
      { practiceCompleted: true },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress', details: err.message });
  }
});

// Save quiz score
router.post('/quiz/:lessonNumber', async (req, res) => {
  try {
    const lessonNumber = Number(req.params.lessonNumber);
    const { score, total } = req.body;
    const updated = await Progress.findOneAndUpdate(
      { userId: req.userId, lessonNumber },
      { quizScore: score, quizTotal: total, completedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quiz', details: err.message });
  }
});

module.exports = router;
