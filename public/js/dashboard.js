const API = '/api';

function getToken() { return localStorage.getItem('cpl_token'); }
function getUser() { return JSON.parse(localStorage.getItem('cpl_user') || 'null'); }
function logout() {
  localStorage.removeItem('cpl_token');
  localStorage.removeItem('cpl_user');
  window.location.href = 'index.html';
}

async function init() {
  const token = getToken();
  if (!token) {
    window.location.href = 'auth.html';
    return;
  }

  const user = getUser();
  document.getElementById('userBox').innerHTML =
    `<span style="font-size:0.85rem;color:var(--muted)">${user ? user.name : ''}</span> ` +
    `<button class="secondary" onclick="logout()" style="margin-left:8px;padding:4px 10px;font-size:0.8rem">Log out</button>`;

  await Promise.all([loadDashboardSummary(), loadLessons()]);
}

async function loadDashboardSummary() {
  try {
    const res = await fetch(`${API}/user/me`, { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) return;
    const data = await res.json();

    // Continue card
    const continueCard = document.getElementById('continueCard');
    const target = data.lastLesson || data.suggestedLesson;
    if (target) {
      document.getElementById('continueLabel').textContent = data.lastLesson
        ? 'Continue where you left off'
        : 'Start here';
      document.getElementById('continueTitle').textContent = `${target.lessonNumber}. ${target.title}`;
      document.getElementById('continueBtn').onclick = () => {
        window.location.href = `lesson.html?n=${target.lessonNumber}`;
      };
      continueCard.classList.remove('hidden');
    }

    // Progress bar
    const { completed, total } = data.progress;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressText').textContent = `${completed}/${total} lessons completed`;
    document.getElementById('progressFill').style.width = pct + '%';
  } catch (err) {
    console.error('Failed to load dashboard summary:', err.message);
  }
}

async function loadLessons() {
  const [lessonsRes, progressRes] = await Promise.all([
    fetch(API + '/lessons'),
    fetch(API + '/progress', { headers: { Authorization: 'Bearer ' + getToken() } })
  ]);
  const lessons = await lessonsRes.json();
  const progress = progressRes.ok ? await progressRes.json() : [];
  const progressMap = {};
  progress.forEach(p => { progressMap[p.lessonNumber] = p; });

  const listEl = document.getElementById('lessonList');
  let html = '';
  let currentModule = null;

  lessons.forEach(lesson => {
    if (lesson.module !== currentModule) {
      currentModule = lesson.module;
      html += `<div class="module-heading">Module ${lesson.module}: ${lesson.moduleTitle}</div>`;
    }
    const p = progressMap[lesson.lessonNumber];
    const done = p && p.practiceCompleted;
    html += `
      <a class="lesson-item ${lesson.isCheckpoint ? 'checkpoint' : ''}" href="lesson.html?n=${lesson.lessonNumber}">
        <span>
          ${lesson.isCheckpoint ? '🏁 ' : ''}${lesson.lessonNumber}. ${lesson.title}
          ${lesson.estimatedTime ? `<br><small style="color:var(--muted)">${lesson.estimatedTime}</small>` : ''}
        </span>
        <span class="badge ${done ? '' : 'pending'}">${done ? 'Done' : 'Start'}</span>
      </a>`;
  });

  listEl.innerHTML = html || '<p style="color:var(--muted)">No lessons yet. Ask Cymor to seed the database.</p>';
}

init();
