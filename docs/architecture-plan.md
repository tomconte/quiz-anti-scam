# Quiz Anti-Arnaque - Architecture Plan (v1)

## 1) Goal
Build a responsive, static web app that helps users identify scams/phishing situations from realistic French scenarios.

Core constraints:
- Static hosting (no backend required for v1)
- Works on phone, tablet, desktop
- Uses existing quiz database (`data/scam-quiz-database.json`)
- Uses generated images in `data/quiz_images/`

## 2) Selected Tech Stack

### Frontend
- React 18+
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Zustand (lightweight app state)

### Quality and validation
- Zod for runtime JSON validation
- Vitest + Testing Library for unit/component tests
- Playwright for key end-to-end flows

### PWA / offline
- `vite-plugin-pwa` for service worker + offline cache

### Analytics
- Plausible (privacy-first, cookie-light)

### Hosting / delivery
- Cloudflare Pages (static deploy from `dist/`)

## 3) High-Level Architecture
- Static SPA served via CDN.
- Quiz content bundled at build time from JSON.
- Images served as static assets from `data/quiz_images/`.
- All user progress/state stored locally in browser (`localStorage`).
- No server-side scoring, session, or account logic in v1.

Primary modules:
- Data layer: load + validate quiz dataset
- Quiz engine: progression, answer checking, scoring
- Persistence layer: save/resume/reset local progress
- UI layer: responsive screens and feedback
- Telemetry layer: anonymous usage events

## 4) Data & Image Strategy

### Source of truth
- Questions: `data/scam-quiz-database.json`
- `manifest.json` is ignored at runtime

### Image mapping rule (agreed)
Map each question to its image by question ID and filename prefix:
- expected prefix: `q{id:02d}_`
- example: question `1` -> file starting with `q01_`

Implementation notes:
- Build an `imageByQuestionId` dictionary during app startup/build.
- Resolve image by matching prefix in available `q*.png` assets.
- If no match exists, render a fallback illustration placeholder.

This keeps image matching deterministic and independent from manifest maintenance.

## 5) App Routing and Core Screens
- `/` Home: project intro + start quiz
- `/quiz` Question flow: scenario, image, answer choices, immediate feedback
- `/result` Final score + breakdown + replay CTA
- `/learn` Optional educational view (tips/patterns by category)

## 6) State Model (v1)
Persisted local state:
- current question index
- selected answers by question ID
- score snapshot
- quiz completion flag
- optional lightweight user prefs (e.g., reduced motion)

Behavior rules:
- Resume unfinished quiz on refresh
- Allow full restart/reset
- Deterministic scoring from `correct_answer`

## 7) Responsive and Accessibility Requirements
- Mobile-first layout, progressively enhanced for tablet/desktop
- Touch-friendly controls and readable type scale
- Keyboard navigation for all answer controls/buttons
- Visible focus states and semantic landmarks
- Minimum color-contrast compliance (WCAG AA target)
- Image `alt` text based on question title/context

## 8) PWA / Offline Behavior
- Cache app shell + bundled quiz data + images
- First load online, subsequent use works offline
- Versioned cache invalidation on new deployment
- Graceful offline indicator when network is unavailable

## 9) Testing Plan

Unit tests:
- JSON schema validation and parsing
- Image ID prefix resolver
- Scoring/progression logic
- Persistence resume/reset behavior

Component tests:
- Answer selection and submission flow
- Feedback rendering (correct/incorrect)
- Result screen calculations

E2E tests:
- Complete 30-question flow on mobile viewport
- Refresh/resume mid-quiz
- Missing image fallback case

## 10) Delivery Plan (phased)

Phase 1 - Foundation:
- Scaffold app, routing, Tailwind, dataset loading/validation
- Implement quiz engine and local persistence

Phase 2 - UX polish:
- Responsive refinements, accessibility, transitions
- Result insights and educational summaries

Phase 3 - Production hardening:
- PWA offline, analytics integration, E2E coverage
- Cloudflare Pages CI/CD and deployment checks

## 11) Non-goals for v1
- User accounts / auth
- Backend APIs / database
- Real-time leaderboard
- Content management UI

## 12) Key Risk and Mitigation
Risk:
- Asset naming drift could break question-image linkage.

Mitigation:
- Add CI check that every question ID resolves to exactly one `q{id:02d}_*.png` file.
