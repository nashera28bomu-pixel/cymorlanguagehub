const express = require('express');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Dashboard payload: user info, last lesson (with title), progress summary
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalLessons = await Lesson.countDocuments();
    const progressDocs = await Progress.find({ userId: req.userId });
    const completedCount = progressDocs.filter(p => p.practiceCompleted).length;

    let lastLesson = null;
    if (user.lastLessonNumber) {
      lastLesson = await Lesson.findOne(
        { lessonNumber: user.lastLessonNumber },
        'lessonNumber title module moduleTitle'
      );
    }

    // If no last lesson yet, suggest lesson 1 (or the first lesson that exists)
    let suggestedLesson = lastLesson;
    if (!suggestedLesson) {
      suggestedLesson = await Lesson.findOne({}, 'lessonNumber title module moduleTitle').sort({ lessonNumber: 1 });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      lastLesson,
      suggestedLesson,
      progress: { completed: completedCount, total: totalLessons }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
});

// Called whenever a learner opens a lesson - updates "continue where you left off"
router.post('/last-lesson', async (req, res) => {
  try {
    const { lessonNumber } = req.body;
    if (!lessonNumber) return res.status(400).json({ error: 'lessonNumber is required' });

    await User.findByIdAndUpdate(req.userId, {
      lastLessonNumber: lessonNumber,
      lastAccessedAt: new Date()
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update last lesson', details: err.message });
  }
});

module.exports = router;
