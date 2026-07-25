const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonNumber: { type: Number, required: true },
  practiceCompleted: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 },
  quizTotal: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

ProgressSchema.index({ userId: 1, lessonNumber: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
