# lironm.com — build notes

Plain HTML/CSS/JS, no build step. Open `index.html` (or, properly, `password-gate.html`) directly in a browser to preview, or upload the whole folder to any static host (Netlify, GitHub Pages, Vercel, etc.).

## ⚠️ Password gate is currently DISABLED
The gate is fully built (all files intact — `password-gate.html`, `js/gate.js`, the eye toggle, everything) but **not enforced right now**, per request, so the site is directly accessible. To turn it back on: open `js/guard.js` and delete the `return;` line near the top (marked with a comment) and the block comment above it.

## What's real and working right now
- Every page's copy, matching what we wrote across the whole design process
- Responsive layout, desktop → mobile, matching the Figma breakpoints
- Working mobile hamburger menu (opens/closes, X toggle)
- Working image lightbox with keyboard (Esc / arrows), swipe on mobile, and correct hide-arrows/counter/dots behavior for single-image galleries
- Password gate: enter the password, get redirected in; wrong password shows an error
- The guard script (`js/guard.js`) that actually enforces the gate on every other page — not just the front door
- WCAG AA-checked color contrast throughout

## What's placeholder / needs your input before this is done

**Images** — every screenshot on the site is a grey placeholder box (`<span class="placeholder-label">Image placeholder`). Replace each `<div class="thumb">` on the homepage cards and case study pages with a real `<img>`.

**Resume** — the footer's "Resume" link points to `resume.pdf`, which doesn't exist yet. Drop your resume file in the root folder with that exact name, or update the link.

**Password gate is NOT real security.** Right now it's a client-side check in `js/gate.js` — the password (`portfolio2026`, change it) sits in plain text in a file anyone can view. This is fine for "keep casual visitors and search engines out," but it will not stop anyone who opens dev tools. If you actually need this private, use your host's real password protection (Netlify has this built in for free) instead of, or in addition to, this script.

**Contact form doesn't send anywhere yet.** `js/main.js` simulates a successful submission after a short delay so you can see the success state, but no email actually goes anywhere. Wire it to Formspree, Netlify Forms, or your own backend — search for the `NOTE:` comment in that file.

**Photo** — the About page has a placeholder in the photo slot.

## Structure
```
index.html            homepage
about.html             about + contact form
password-gate.html     entry point
work/*.html             six case studies
css/style.css           all styles, design tokens as CSS variables at the top
js/main.js              nav toggle, lightbox, contact form
js/gate.js              password check (password-gate.html only)
js/guard.js             enforces the gate on every other page
```
