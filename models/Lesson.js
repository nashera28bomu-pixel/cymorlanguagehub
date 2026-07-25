const mongoose = require('mongoose');

// Sub-schemas kept loose (Mixed-friendly) so lesson JSON files can evolve
// without needing a migration every time a field is tweaked.

const RealWorldApplicationSchema = new mongoose.Schema({
  title: String,
  description: String
}, { _id: false });

const TheorySectionSchema = new mongoose.Schema({
  heading: String,
  content: String
}, { _id: false });

const ExampleSchema = new mongoose.Schema({
  title: String,
  code: { type: String, required: true },
  explanation: String,
  output: String
}, { _id: false });

const StepByStepSchema = new mongoose.Schema({
  line: String,
  explanation: String
}, { _id: false });

const CommonMistakeSchema = new mongoose.Schema({
  mistake: String,
  why: String,
  fix: String
}, { _id: false });

const DebuggingChallengeSchema = new mongoose.Schema({
  title: String,
  brokenCode: String,
  question: String,
  solution: String
}, { _id: false });

const PracticeExerciseSchema = new mongoose.Schema({
  id: Number,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  prompt: { type: String, required: true },
  starterCode: { type: String, default: '' },
  expectedOutput: { type: String, required: true }
}, { _id: false });

const MiniChallengeSchema = new mongoose.Schema({
  title: String,
  description: String
}, { _id: false });

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true }, // index into options
  explanation: { type: String, default: '' }
}, { _id: false });

const NextLessonSchema = new mongoose.Schema({
  lessonNumber: Number,
  title: String,
  preview: String
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  lessonNumber: { type: Number, required: true, unique: true },
  module: { type: Number, required: true },
  moduleTitle: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String },
  estimatedTime: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  isCheckpoint: { type: Boolean, default: false },

  learningObjectives: { type: [String], default: [] },
  prerequisites: { type: [Number], default: [] }, // lessonNumbers that should be done first

  introduction: { type: String, required: true },

  whyLearn: {
    title: String,
    content: [String]
  },

  realWorldApplications: { type: [RealWorldApplicationSchema], default: [] },

  didYouKnow: {
    title: String,
    facts: [String]
  },

  theory: {
    sections: { type: [TheorySectionSchema], default: [] }
  },

  examples: { type: [ExampleSchema], default: [] },

  stepByStepExecution: { type: [StepByStepSchema], default: [] },

  commonMistakes: { type: [CommonMistakeSchema], default: [] },

  debuggingChallenge: DebuggingChallengeSchema,

  practiceExercises: { type: [PracticeExerciseSchema], default: [] },

  miniChallenge: MiniChallengeSchema,

  hints: { type: [String], default: [] },

  quiz: { type: [QuizQuestionSchema], default: [] },

  summary: { type: String },
  keyTakeaways: { type: [String], default: [] },
  nextLesson: NextLessonSchema,

  order: { type: Number } // optional explicit ordering override; falls back to lessonNumber
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
