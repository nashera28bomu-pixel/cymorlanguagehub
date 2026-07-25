const express = require('express');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Get all lessons (light payload for sidebar/module list)
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find({}, 'lessonNumber module moduleTitle title isCheckpoint estimatedTime difficulty')
      .sort({ lessonNumber: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load lessons', details: err.message });
  }
});

// Get single lesson full content
router.get('/:lessonNumber', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ lessonNumber: Number(req.params.lessonNumber) });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load lesson', details: err.message });
  }
});

module.exports = router;
