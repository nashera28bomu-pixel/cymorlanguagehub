const API = '/api';
let isRegisterMode = false;

function getToken() { return localStorage.getItem('cpl_token'); }
function getUser() { return JSON.parse(localStorage.getItem('cpl_user') || 'null'); }
function saveSession(token, user) {
  localStorage.setItem('cpl_token', token);
  localStorage.setItem('cpl_user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('cpl_token');
  localStorage.removeItem('cpl_user');
  window.location.reload();
}

async function init() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    document.getElementById('authCard').classList.remove('hidden');
    setupAuthForm();
    return;
  }

  document.getElementById('userBox').innerHTML =
    `<span style="font-size:0.85rem;color:var(--muted)">${user.name}</span> ` +
    `<button class="secondary" onclick="logout()" style="margin-left:8px;padding:4px 10px;font-size:0.8rem">Log out</button>`;

  document.getElementById('lessonListWrap').classList.remove('hidden');
  await loadLessons();
}

function setupAuthForm() {
  const switchLink = document.getElementById('authSwitchLink');
  switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.getElementById('authTitle').textContent = isRegisterMode ? 'Create account' : 'Log in';
    document.getElementById('authSubmit').textContent = isRegisterMode ? 'Register' : 'Log in';
    document.getElementById('authSwitchText').textContent = isRegisterMode ? 'Have an account?' : 'No account?';
    switchLink.textContent = isRegisterMode ? 'Log in' : 'Register';
    document.getElementById('registerFields').classList.toggle('hidden', !isRegisterMode);
  });

  document.getElementById('authSubmit').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const name = document.getElementById('nameInput').value.trim();

    if (!email || !password || (isRegisterMode && !name)) {
      alert('Please fill in all fields.');
      return;
    }

    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
    const body = isRegisterMode ? { name, email, password } : { email, password };

    try {
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Something went wrong'); return; }
      saveSession(data.token, data.user);
      window.location.reload();
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });
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

  listEl.innerHTML = html || '<p style="color:var(--muted)">No lessons yet. Seed the database to get started.</p>';
}

init();
