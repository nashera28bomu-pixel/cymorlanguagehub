// ---------- Loading screen: Python-style boot sequence ----------
const bootLines = [
  '>>> import cymor_python_learner',
  '>>> loading modules... ok',
  '>>> connecting to lesson engine... ok',
  '>>> starting pyodide runtime... ok',
  '>>> ready.'
];

function runLoadingSequence() {
  const linesEl = document.getElementById('loadingLines');
  const barFill = document.getElementById('loadingBarFill');
  const percentEl = document.getElementById('loadingPercent');

  let shown = 0;
  let percent = 0;

  const lineInterval = setInterval(() => {
    if (shown < bootLines.length) {
      linesEl.textContent += bootLines[shown] + '\n';
      shown++;
    } else {
      clearInterval(lineInterval);
    }
  }, 380);

  const percentInterval = setInterval(() => {
    percent += Math.floor(Math.random() * 9) + 4; // random-ish increments
    if (percent >= 100) {
      percent = 100;
      clearInterval(percentInterval);
      finishLoading();
    }
    barFill.style.width = percent + '%';
    percentEl.textContent = percent + '%';
  }, 220);
}

function finishLoading() {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    const siteContent = document.getElementById('siteContent');
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      siteContent.classList.remove('hidden');
      startDemoCodeAnimation();
    }, 400);
  }, 350);
}

// ---------- Sample code in action: typewriter effect ----------
const demoSnippet = `name = input("What's your name? ")
score = 0

for i in range(3):
    print(f"Question {i+1}: 2 + 2 = ?")
    score += 1

print(f"{name}, you scored {score}/3!")`;

const demoOutputText = `What's your name? Amina
Question 1: 2 + 2 = ?
Question 2: 2 + 2 = ?
Question 3: 2 + 2 = ?
Amina, you scored 3/3!`;

function startDemoCodeAnimation() {
  const codeEl = document.getElementById('demoCode');
  const outputEl = document.getElementById('demoOutput');
  if (!codeEl) return;

  let i = 0;
  function typeCode() {
    if (i <= demoSnippet.length) {
      codeEl.textContent = demoSnippet.slice(0, i);
      i++;
      setTimeout(typeCode, 14);
    } else {
      setTimeout(typeOutput, 400);
    }
  }

  let j = 0;
  function typeOutput() {
    if (j <= demoOutputText.length) {
      outputEl.textContent = demoOutputText.slice(0, j);
      j++;
      setTimeout(typeOutput, 10);
    } else {
      // loop the whole demo after a pause
      setTimeout(() => {
        codeEl.textContent = '';
        outputEl.textContent = '';
        i = 0; j = 0;
        typeCode();
      }, 4000);
    }
  }

  typeCode();
}

// ---------- Navigation ----------
function goToStart() {
  const token = localStorage.getItem('cpl_token');
  window.location.href = token ? 'dashboard.html' : 'auth.html';
}

function setupNav() {
  const navStart = document.getElementById('navStart');
  const heroStart = document.getElementById('heroStartBtn');
  const heroFeatures = document.getElementById('heroFeaturesBtn');

  if (navStart) navStart.addEventListener('click', goToStart);
  if (heroStart) heroStart.addEventListener('click', goToStart);
  if (heroFeatures) heroFeatures.addEventListener('click', () => {
    document.getElementById('featuresSection').scrollIntoView({ behavior: 'smooth' });
  });
}

setupNav();
runLoadingSequence();
