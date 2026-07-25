const express = require('express');
const fs = require('fs');
const path = require('path');
const Lesson = require('../models/Lesson');

const router = express.Router();
const LESSONS_DIR = path.join(__dirname, '..', 'data', 'lessons');

// Visit /api/admin/seed?key=YOUR_SEED_KEY from the browser to seed the database.
// Protected by ADMIN_SEED_KEY env var so randoms can't wipe/reseed your data.
router.get('/seed', async (req, res) => {
  const providedKey = req.query.key;
  if (!process.env.ADMIN_SEED_KEY || providedKey !== process.env.ADMIN_SEED_KEY) {
    return res.status(403).json({ error: 'Invalid or missing seed key' });
  }

  try {
    const files = fs.readdirSync(LESSONS_DIR)
      .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    const results = [];

    for (const file of files) {
      const filePath = path.join(LESSONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');

      let lesson;
      try {
        lesson = JSON.parse(raw);
      } catch (parseErr) {
        results.push({ file, status: 'skipped', reason: `Invalid JSON: ${parseErr.message}` });
        continue;
      }

      if (!lesson.lessonNumber) {
        results.push({ file, status: 'skipped', reason: 'Missing lessonNumber' });
        continue;
      }

      await Lesson.findOneAndUpdate(
        { lessonNumber: lesson.lessonNumber },
        lesson,
        { upsert: true, new: true, runValidators: true }
      );
      results.push({ file, status: 'seeded', lessonNumber: lesson.lessonNumber, title: lesson.title });
    }

    res.json({ message: 'Seeding complete', count: results.filter(r => r.status === 'seeded').length, results });
  } catch (err) {
    res.status(500).json({ error: 'Seeding failed', details: err.message });
  }
});

module.exports = router;
