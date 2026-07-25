const API = '/api';
let isRegisterMode = false;

function getToken() { return localStorage.getItem('cpl_token'); }
function saveSession(token, user) {
  localStorage.setItem('cpl_token', token);
  localStorage.setItem('cpl_user', JSON.stringify(user));
}

function init() {
  // already logged in - skip straight to dashboard
  if (getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }
  setupAuthForm();
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
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });
}

init();
