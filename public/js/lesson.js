const API = '/api';
const params = new URLSearchParams(window.location.search);
const lessonNumber = params.get('n');

let pyodideReady = null;
let currentLesson = null;
let exerciseResults = {}; // { exerciseId: true/false }

function getToken() { return localStorage.getItem('cpl_token'); }

function loadPyodideOnce() {
  if (!pyodideReady) pyodideReady = loadPyodide();
  return pyodideReady;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

async function fetchLesson() {
  const res = await fetch(`${API}/lessons/${lessonNumber}`);
  if (!res.ok) {
    document.getElementById('lessonContainer').innerHTML = '<p>Lesson not found.</p>';
    return;
  }
  currentLesson = await res.json();
  render(currentLesson);
}

function render(lesson) {
  const container = document.getElementById('lessonContainer');

  container.innerHTML = `
    ${headerBlock(lesson)}
    ${lesson.introduction ? section('Introduction', `<p style="white-space:pre-line">${esc(lesson.introduction)}</p>`) : ''}
    ${objectivesBlock(lesson)}
    ${whyLearnBlock(lesson)}
    ${realWorldBlock(lesson)}
    ${didYouKnowBlock(lesson)}
    ${theoryBlock(lesson)}
    ${examplesBlock(lesson)}
    ${stepByStepBlock(lesson)}
    ${commonMistakesBlock(lesson)}
    ${debuggingChallengeBlock(lesson)}
    ${practiceBlock(lesson)}
    ${miniChallengeBlock(lesson)}
    ${quizBlock(lesson)}
    ${summaryBlock(lesson)}
    ${nextLessonBlock(lesson)}
    <a href="index.html" class="btn secondary" style="display:inline-block;margin:16px 0;text-decoration:none">← Back to lessons</a>
  `;

  attachPracticeHandlers(lesson);
  attachQuizHandlers(lesson.quiz || []);
  initPyodideStatus();
}

function section(title, innerHtml, extraClass = '') {
  return `<div class="card ${extraClass}"><h3 style="color:var(--accent2);margin-bottom:10px">${title}</h3>${innerHtml}</div>`;
}

function headerBlock(lesson) {
  return `
    <div class="card">
      <div style="color:var(--muted);font-size:0.8rem">Module ${lesson.module}: ${esc(lesson.moduleTitle)}</div>
      <h2>${lesson.isCheckpoint ? '🏁 ' : ''}${esc(lesson.title)}</h2>
      <div style="display:flex;gap:10px;margin-top:8px;font-size:0.8rem;color:var(--muted)">
        ${lesson.difficulty ? `<span>📊 ${esc(lesson.difficulty)}</span>` : ''}
        ${lesson.estimatedTime ? `<span>⏱ ${esc(lesson.estimatedTime)}</span>` : ''}
      </div>
    </div>`;
}

function objectivesBlock(lesson) {
  if (!lesson.learningObjectives || lesson.learningObjectives.length === 0) return '';
  const items = lesson.learningObjectives.map(o => `<li>${esc(o)}</li>`).join('');
  return section('🎯 Learning Objectives', `<ul style="padding-left:20px">${items}</ul>`);
}

function whyLearnBlock(lesson) {
  if (!lesson.whyLearn || !lesson.whyLearn.content) return '';
  const items = lesson.whyLearn.content.map(c => `<li>${esc(c)}</li>`).join('');
  return section(esc(lesson.whyLearn.title || 'Why Learn This?'), `<ul style="padding-left:20px">${items}</ul>`);
}

function realWorldBlock(lesson) {
  if (!lesson.realWorldApplications || lesson.realWorldApplications.length === 0) return '';
  const items = lesson.realWorldApplications.map(a =>
    `<div style="margin-bottom:10px"><strong>${esc(a.title)}</strong><p style="color:var(--muted);font-size:0.9rem">${esc(a.description)}</p></div>`
  ).join('');
  return section('🌍 Real-World Applications', items);
}

function didYouKnowBlock(lesson) {
  if (!lesson.didYouKnow || !lesson.didYouKnow.facts) return '';
  const items = lesson.didYouKnow.facts.map(f => `<li>${esc(f)}</li>`).join('');
  return section(esc(lesson.didYouKnow.title || 'Did You Know?'), `<ul style="padding-left:20px">${items}</ul>`, 'checkpoint');
}

function theoryBlock(lesson) {
  if (!lesson.theory || !lesson.theory.sections || lesson.theory.sections.length === 0) return '';
  const items = lesson.theory.sections.map(s =>
    `<div style="margin-bottom:16px"><h4 style="margin-bottom:6px">${esc(s.heading)}</h4><p style="white-space:pre-line;font-size:0.95rem">${esc(s.content)}</p></div>`
  ).join('');
  return section('📖 Theory', items);
}

function examplesBlock(lesson) {
  if (!lesson.examples || lesson.examples.length === 0) return '';
  const items = lesson.examples.map(ex => `
    <div style="margin-bottom:16px">
      ${ex.title ? `<div style="font-size:0.85rem;color:var(--muted);margin-bottom:4px">${esc(ex.title)}</div>` : ''}
      <pre>${esc(ex.code)}</pre>
      ${ex.explanation ? `<p style="font-size:0.85rem;color:var(--muted);margin:6px 0">${esc(ex.explanation)}</p>` : ''}
      <div style="font-size:0.8rem;color:var(--muted)">Output:</div>
      <pre>${esc(ex.output)}</pre>
    </div>`).join('');
  return section('💻 Examples', items);
}

function stepByStepBlock(lesson) {
  if (!lesson.stepByStepExecution || lesson.stepByStepExecution.length === 0) return '';
  const items = lesson.stepByStepExecution.map((s, i) =>
    `<div style="display:flex;gap:10px;margin-bottom:8px;font-size:0.9rem">
      <span style="color:var(--accent2)">${i + 1}.</span>
      <div><code style="background:#010409;padding:2px 6px;border-radius:4px">${esc(s.line)}</code>
      <p style="color:var(--muted);margin-top:2px">${esc(s.explanation)}</p></div>
    </div>`).join('');
  return section('🔍 Step-by-Step Execution', items);
}

function commonMistakesBlock(lesson) {
  if (!lesson.commonMistakes || lesson.commonMistakes.length === 0) return '';
  const items = lesson.commonMistakes.map(m => `
    <div style="margin-bottom:12px;padding:10px;border-radius:8px;background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.3)">
      <div style="color:var(--error)"><code>${esc(m.mistake)}</code></div>
      <p style="font-size:0.85rem;color:var(--muted);margin:4px 0">${esc(m.why)}</p>
      <div style="color:var(--success)">✓ <code>${esc(m.fix)}</code></div>
    </div>`).join('');
  return section('⚠️ Common Mistakes', items);
}

function debuggingChallengeBlock(lesson) {
  const dc = lesson.debuggingChallenge;
  if (!dc) return '';
  return section(`🐛 ${esc(dc.title || 'Debugging Challenge')}`, `
    <pre>${esc(dc.brokenCode)}</pre>
    <p style="margin:10px 0"><strong>${esc(dc.question)}</strong></p>
    <details><summary style="cursor:pointer;color:var(--accent2)">Show solution</summary>
      <p style="margin-top:8px;font-size:0.9rem">${esc(dc.solution)}</p>
    </details>`);
}

function practiceBlock(lesson) {
  if (!lesson.practiceExercises || lesson.practiceExercises.length === 0) return '';
  const items = lesson.practiceExercises.map(ex => `
    <div class="card" style="background:#0d1117;margin-bottom:12px" data-exercise-id="${ex.id}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Exercise ${ex.id}</strong>
        <span style="font-size:0.75rem;color:var(--muted)">${esc(ex.difficulty)}</span>
      </div>
      <p style="margin-bottom:10px">${esc(ex.prompt)}</p>
      <textarea id="codeEditor-${ex.id}" class="code-editor" spellcheck="false">${esc(ex.starterCode || '')}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="run-btn" data-id="${ex.id}">▶ Run Code</button>
      </div>
      <pre id="runOutput-${ex.id}" class="hidden" style="margin-top:10px"></pre>
      <p id="resultMsg-${ex.id}" style="margin-top:8px;font-weight:600"></p>
    </div>`).join('');

  return `
    <div class="card">
      <h3 style="color:var(--accent2);margin-bottom:6px">🧪 Practice Point</h3>
      <div id="pyodideStatus" style="font-size:0.8rem;color:var(--muted);margin-bottom:14px">Loading Python engine...</div>
      ${items}
      <div id="hintBox" style="margin-top:10px">
        <button id="hintBtn" class="secondary hint-btn">💡 Hint</button>
        <p id="hintText" style="font-size:0.85rem;color:var(--accent2);margin-top:8px" class="hidden"></p>
      </div>
    </div>`;
}

function miniChallengeBlock(lesson) {
  const mc = lesson.miniChallenge;
  if (!mc) return '';
  return section(`🏆 ${esc(mc.title || 'Mini Challenge')}`, `<p>${esc(mc.description)}</p>`, 'checkpoint');
}

function quizBlock(lesson) {
  return section('📝 Quiz', `<div id="quizArea"></div>`);
}

function summaryBlock(lesson) {
  if (!lesson.summary && (!lesson.keyTakeaways || lesson.keyTakeaways.length === 0)) return '';
  const takeaways = (lesson.keyTakeaways || []).map(t => `<li>${esc(t)}</li>`).join('');
  return section('✅ Summary', `
    ${lesson.summary ? `<p style="white-space:pre-line;margin-bottom:12px">${esc(lesson.summary)}</p>` : ''}
    ${takeaways ? `<strong>Key Takeaways</strong><ul style="padding-left:20px;margin-top:6px">${takeaways}</ul>` : ''}
  `);
}

function nextLessonBlock(lesson) {
  const nl = lesson.nextLesson;
  if (!nl) return '';
  return `
    <a href="lesson.html?n=${nl.lessonNumber}" class="card" style="display:block;text-decoration:none;color:var(--text);border-color:var(--accent)">
      <div style="font-size:0.8rem;color:var(--muted)">Next Lesson</div>
      <strong>${esc(nl.title)}</strong>
      <p style="font-size:0.85rem;color:var(--muted);margin-top:4px">${esc(nl.preview)}</p>
    </a>`;
}

async function initPyodideStatus() {
  const statusEl = document.getElementById('pyodideStatus');
  if (!statusEl) return;
  try {
    await loadPyodideOnce();
    statusEl.textContent = 'Python engine ready.';
  } catch (err) {
    statusEl.textContent = 'Could not load Python engine. Check your connection.';
  }
}

function attachPracticeHandlers(lesson) {
  const exercises = lesson.practiceExercises || [];

  document.querySelectorAll('.run-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const exercise = exercises.find(e => String(e.id) === String(id));
      await runExercise(exercise, btn);
    });
  });

  let hintIndex = 0;
  const hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      const hints = lesson.hints || [];
      if (hints.length === 0) return;
      const hintText = document.getElementById('hintText');
      hintText.textContent = `Hint ${hintIndex + 1}/${hints.length}: ${hints[hintIndex]}`;
      hintText.classList.remove('hidden');
      hintIndex = (hintIndex + 1) % hints.length;
    });
  }
}

async function runExercise(exercise, btn) {
  const outputEl = document.getElementById(`runOutput-${exercise.id}`);
  const resultEl = document.getElementById(`resultMsg-${exercise.id}`);
  const code = document.getElementById(`codeEditor-${exercise.id}`).value;

  btn.disabled = true;
  btn.textContent = 'Running...';
  outputEl.classList.remove('hidden');
  resultEl.textContent = '';

  try {
    const pyodide = await loadPyodideOnce();
    let capturedOutput = '';
    pyodide.setStdout({ batched: (msg) => { capturedOutput += msg + '\n'; } });

    await pyodide.runPythonAsync(code);

    const actual = capturedOutput.trim();
    outputEl.textContent = actual || '(no output)';

    const expected = (exercise.expectedOutput || '').trim();
    const passed = actual === expected;

    if (passed) {
      outputEl.className = 'output-ok';
      resultEl.innerHTML = '<span style="color:var(--success)">✓ Correct!</span>';
      exerciseResults[exercise.id] = true;
    } else {
      outputEl.className = 'output-fail';
      resultEl.innerHTML = '<span style="color:var(--error)">✗ Not quite - compare with the expected output and try again.</span>';
      exerciseResults[exercise.id] = false;
    }

    checkLessonProgress();
  } catch (err) {
    outputEl.textContent = 'Error:\n' + err.message;
    outputEl.className = 'output-fail';
    resultEl.textContent = '';
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ Run Code';
  }
}

function checkLessonProgress() {
  const total = (currentLesson.practiceExercises || []).length;
  const solved = Object.values(exerciseResults).filter(Boolean).length;
  if (total > 0 && solved === total) {
    markPracticeComplete();
  }
}

async function markPracticeComplete() {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${API}/progress/practice/${lessonNumber}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
  } catch (err) {
    console.error('Failed to save progress:', err.message);
  }
}

function attachQuizHandlers(questions) {
  const quizArea = document.getElementById('quizArea');
  if (!quizArea) return;
  if (questions.length === 0) {
    quizArea.innerHTML = '<p style="color:var(--muted)">No quiz for this lesson.</p>';
    return;
  }

  let score = 0;
  let answered = 0;

  questions.forEach((q, qIndex) => {
    const block = document.createElement('div');
    block.style.marginBottom = '20px';
    block.innerHTML = `<p style="margin-bottom:8px">${qIndex + 1}. ${esc(q.question)}</p>`;

    q.options.forEach((opt, optIndex) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'quiz-option';
      optBtn.textContent = opt;
      optBtn.addEventListener('click', () => {
        if (optBtn.dataset.locked) return;
        const allBtns = block.querySelectorAll('.quiz-option');
        allBtns.forEach(b => b.dataset.locked = 'true');

        if (optIndex === q.correctAnswer) {
          optBtn.classList.add('correct');
          score++;
        } else {
          optBtn.classList.add('wrong');
          allBtns[q.correctAnswer].classList.add('correct');
        }
        answered++;

        const explainEl = document.createElement('p');
        explainEl.style.fontSize = '0.85rem';
        explainEl.style.color = 'var(--muted)';
        explainEl.style.marginTop = '6px';
        explainEl.textContent = q.explanation;
        block.appendChild(explainEl);

        if (answered === questions.length) saveQuizScore(score, questions.length);
      });
      block.appendChild(optBtn);
    });

    quizArea.appendChild(block);
  });
}

async function saveQuizScore(score, total) {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${API}/progress/quiz/${lessonNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ score, total })
    });
  } catch (err) {
    console.error('Failed to save quiz score:', err.message);
  }
}

fetchLesson();
