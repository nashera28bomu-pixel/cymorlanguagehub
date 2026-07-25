require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

const LESSONS_DIR = path.join(__dirname, 'lessons');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const files = fs.readdirSync(LESSONS_DIR)
      .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    if (files.length === 0) {
      console.log(`No lesson-*.json files found in ${LESSONS_DIR}`);
      process.exit(0);
    }

    for (const file of files) {
      const filePath = path.join(LESSONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');

      let lesson;
      try {
        lesson = JSON.parse(raw);
      } catch (parseErr) {
        console.error(`Skipping ${file} - invalid JSON: ${parseErr.message}`);
        continue;
      }

      if (!lesson.lessonNumber) {
        console.error(`Skipping ${file} - missing lessonNumber`);
        continue;
      }

      await Lesson.findOneAndUpdate(
        { lessonNumber: lesson.lessonNumber },
        lesson,
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`Seeded lesson ${lesson.lessonNumber}: ${lesson.title}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
