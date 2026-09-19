// NOTE: this is a client-side placeholder, not real security. Anyone who
// views source can read PLACEHOLDER_PASSWORD. Fine for "keep casual visitors
// out," not fine for anything that actually needs to be private -- swap for
// a real backend check (or a hosting-level password, e.g. Netlify's
// password-protected deploys) before this matters.
const PLACEHOLDER_PASSWORD = '888888';

document.addEventListener('DOMContentLoaded', () => {
  // already unlocked this session? skip straight through
  if (sessionStorage.getItem('gate-unlocked') === 'true') {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-input');
  const error = document.getElementById('gate-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === PLACEHOLDER_PASSWORD) {
      sessionStorage.setItem('gate-unlocked', 'true');
      window.location.href = 'index.html';
    } else {
      error.classList.add('show');
      input.focus();
      input.select();
    }
  });

  input.addEventListener('input', () => error.classList.remove('show'));

  // eyeball toggle: show/hide the typed password
  const eyeBtn = document.getElementById('gate-eye');
  const eyeOpen = document.getElementById('gate-eye-open');
  const eyeClosed = document.getElementById('gate-eye-closed');
  eyeBtn.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    eyeOpen.style.display = showing ? '' : 'none';
    eyeClosed.style.display = showing ? 'none' : '';
    eyeBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    eyeBtn.setAttribute('aria-pressed', showing ? 'false' : 'true');
    input.focus();
  });
});
