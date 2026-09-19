// Included on every real page. Without this, the password gate is just a
// front door -- anyone could still type the direct URL of another page and
// get straight in. This check is what actually enforces the gate.
//
// TEMPORARILY DISABLED (per request) -- the gate is still fully built
// (password-gate.html, gate.js, the eye toggle, etc. are all untouched),
// it's just not being enforced right now. To turn it back on, delete the
// early return below and this comment block.
(function () {
  return; // <-- remove this line to re-enable the gate

  if (sessionStorage.getItem('gate-unlocked') !== 'true') {
    const depth = document.body.dataset.depth || '';
    window.location.replace(depth + 'password-gate.html');
  }
})();
