# Cymor Python Learner

Learn Python from scratch — real theory, worked examples, and hands-on practice points that run live in the browser (no server-side code execution needed).

## Stack
- Node.js / Express backend
- MongoDB Atlas for lessons, users, and progress
- Vanilla HTML/CSS/JS frontend (no build step)
- Pyodide (WASM Python) for in-browser code execution — practice points run entirely client-side, zero backend cost

## Setup (Render + MongoDB Atlas, mobile-only workflow)

1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster, get your connection string.
3. On Render: New Web Service → connect repo → set environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = any long random string
   - `PORT` = 3000 (Render sets this automatically, but keep as fallback)
4. Build command: `npm install`
5. Start command: `npm start`
6. After first deploy, run the seed script once to populate Module 1 lessons:
   - Render Shell tab (if available on your plan): `npm run seed`
   - Or run seed.js locally against the same MONGODB_URI before deploying

## Structure
```
server.js                  - Express app entry point
models/Lesson.js           - full rich lesson schema (see below)
models/User.js, Progress.js
routes/                    - auth, lessons, progress endpoints
middleware/auth.js         - JWT verification
data/lessons/lesson-N.json - one JSON file per lesson (this is where you add content)
data/seed.js                - reads every lesson-*.json file and upserts into MongoDB
public/                    - frontend (index.html = lesson list, lesson.html = lesson view)
public/js/lesson.js        - renders the full lesson schema + Pyodide practice runner + quiz
```

## Lesson JSON format
Each lesson is its own file at `data/lessons/lesson-N.json`. Fields:

| Field | Purpose |
|---|---|
| `lessonNumber`, `module`, `moduleTitle`, `title`, `slug`, `estimatedTime`, `difficulty`, `isCheckpoint` | metadata |
| `learningObjectives` | bullet list shown at the top |
| `introduction` | opening paragraph(s) |
| `whyLearn` | `{ title, content[] }` motivation bullets |
| `realWorldApplications` | `[{ title, description }]` |
| `didYouKnow` | `{ title, facts[] }` |
| `theory.sections` | `[{ heading, content }]` — the core teaching material |
| `examples` | `[{ title, code, explanation, output }]` — worked examples (read-only, not run) |
| `stepByStepExecution` | `[{ line, explanation }]` — optional line-by-line walkthrough |
| `commonMistakes` | `[{ mistake, why, fix }]` |
| `debuggingChallenge` | `{ title, brokenCode, question, solution }` — solution hidden behind a details toggle |
| `practiceExercises` | `[{ id, difficulty, prompt, starterCode, expectedOutput }]` — these run live via Pyodide |
| `miniChallenge` | `{ title, description }` |
| `hints` | array of strings, cycled through by the Hint button |
| `quiz` | `[{ question, options[], correctAnswer (index), explanation }]` |
| `summary`, `keyTakeaways` | closing recap |
| `nextLesson` | `{ lessonNumber, title, preview }` — powers the next-lesson card |

To add a lesson: drop a new `lesson-N.json` in `data/lessons/` following this shape, then run `npm run seed`. The seed script reads every file in that folder and upserts by `lessonNumber`, so re-running it is always safe.

## How practice points work
Each `practiceExercises` entry runs through Pyodide, a full Python interpreter compiled to WebAssembly that loads in the browser. When a learner clicks "Run Code" on an exercise:
1. Pyodide executes their code
2. stdout is captured
3. Output is compared exactly against that exercise's `expectedOutput`
4. Once all exercises in a lesson pass, progress is saved to MongoDB via `/api/progress/practice/:lessonNumber`

No sandboxing concerns since it all runs in the user's own browser tab — same approach used safely by many browser-based Python education tools.

## Content status
Lesson 1 (What is Python & Running Your First Script) is fully seeded in the new rich format. Add lessons 2 onward the same way, one JSON file per lesson.
