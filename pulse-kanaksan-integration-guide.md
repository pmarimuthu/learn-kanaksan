# pulse-kanaksan Integration Guide

**Project:** `learn.kanaksan.com`  
**Analytics backend:** Firebase project `pulse-kanaksan` (Firestore, asia-south1)  
**SDK location:** `C:\MyApps\learn.kanaksan.com\docs\.vitepress\theme\pulse\`

---

## Overview

pulse-kanaksan is a shared, cross-project visitor analytics backend built on Firebase Firestore. It tracks:

- Unique visitors (device fingerprint deduplication)
- Total visits, unique visits, today's visits per project
- Per-page visit statistics
- Per-page user ratings (5-level understanding scale)
- Bug / issue reports with category and optional comment

No authentication required. All writes are guarded by Firestore security rules. Tracking is silently skipped on localhost and for bots.

---

## Firebase Project

| Property | Value |
|---|---|
| Project ID | `pulse-kanaksan` |
| Firestore region | `asia-south1` |
| Analytics key (this app) | `learn.kanaksan.com` |

---

## Environment Variables

**`C:\MyApps\learn.kanaksan.com\.env`** (never commit this file):

```env
VITE_PULSE_API_KEY=AIzaSyDxQ0aFevndXamxljOYrwUW3FBHDQGJbEI
VITE_PULSE_AUTH_DOMAIN=pulse-kanaksan.firebaseapp.com
VITE_PULSE_PROJECT_ID=pulse-kanaksan
VITE_PULSE_STORAGE_BUCKET=pulse-kanaksan.firebasestorage.app
VITE_PULSE_MESSAGING_SENDER_ID=559994788703
VITE_PULSE_APP_ID=1:559994788703:web:6bd849aa2a1e0cfc39f4ea
VITE_PULSE_ANALYTICS_KEY=learn.kanaksan.com
```

`VITE_PULSE_ANALYTICS_KEY` is the Firestore collection key for this app — all data is scoped under `projects/learn.kanaksan.com/`.

---

## Dependencies

Added to `C:\MyApps\learn.kanaksan.com\package.json`:

```json
"@fingerprintjs/fingerprintjs": "^4.0.0",
"firebase": "^12.15.0"
```

Run `npm install` after any change to `package.json`.

---

## Firestore Data Model

```
visitors/{fingerprintId}                          # global device record
  firstSeen, lastSeen

  /projects/{projectId}                           # per-project device record
    firstSeen, lastSeen

    /pages/{pageKey}                              # per-page device record
      firstSeen, lastSeen

projects/{projectId}/stats/global                 # aggregated project stats
  total, unique, todayCount, todayDate

projects/{projectId}/pages/{pageKey}              # aggregated page stats
  pageKey, total, unique

projects/{projectId}/ratings/{autoId}             # user ratings
  pageKey, fingerprintId, score (1–5), ts

projects/{projectId}/issues/{autoId}              # bug reports
  pageKey, fingerprintId, category, comment, ts
```

`pageKey` is derived from the URL path: `/physics/chapters/units/` → `physics_chapters_units`. Home page → `home`.

---

## SDK Module Files

### `pulse/config.ts`
Initialises a named Firebase app `'pulse'` to avoid conflicts with any other Firebase instance in the project.

### `pulse/fingerprint.ts`
Singleton wrapper around `@fingerprintjs/fingerprintjs`. Returns a stable 32-char hex visitor ID per device/browser. Loaded lazily on first call.

### `pulse/tracker.ts`
Raw Firestore write functions:

| Function | Description |
|---|---|
| `recordVisit(projectId, pageKey, fingerprintId)` | Deduplicates globally and per-project, increments stats and page counters |
| `saveRating(projectId, pageKey, fingerprintId, score)` | Appends a rating document (score 1–5) |
| `saveIssue(projectId, pageKey, fingerprintId, category, comment)` | Appends an issue report document |

### `pulse/index.ts`
Public API — handles fingerprinting, tracking guard, and error suppression.

| Export | Description |
|---|---|
| `trackVisit(pageKey)` | Records a page visit |
| `submitRating(pageKey, score)` | Saves a user rating |
| `submitIssue(pageKey, category, comment)` | Saves a bug report |

**Tracking guard** — writes are silently skipped if:
- `window` is undefined (SSR)
- `window.location.hostname !== 'learn.kanaksan.com'` (localhost, staging, bots via REST)
- `navigator.webdriver === true` (headless browsers / scrapers)

---

## Page Visit Tracking

Wired in `Layout.vue`. Fires on mount and on every route change:

```ts
import { trackVisit } from './pulse'

function pageKey(path) {
  return path.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home'
}

onMounted(() => trackVisit(pageKey(route.path)))

watch(() => route.path, (path) => {
  trackVisit(pageKey(path))
})
```

---

## Rating Widget

**Component:** `docs/.vitepress/theme/components/RatingWidget.vue`

A modal overlay with a 5-level understanding scale:

| Score | Emoji | Label |
|---|---|---|
| 1 | 😵 | Lost |
| 2 | 🤔 | Confused |
| 3 | 🙂 | Getting it |
| 4 | 💡 | Got it! |
| 5 | 🚀 | Mastered! |

- Tapping an emoji highlights it and immediately submits — no confirm step
- Modal auto-closes 1.4 seconds after submission
- Uses `submitRating(pageKey, score)` from `pulse/index.ts`
- Stored in Firestore: `projects/learn.kanaksan.com/ratings/{autoId}`

---

## Bug Report Widget

**Component:** `docs/.vitepress/theme/components/ReportIssue.vue`

A modal with a category dropdown and optional comment field.

**Categories:**
- Content error
- Diagram / image issue
- Animation not working
- Formula / equation error
- Broken link
- Typo / language
- Other

**Comment field rules:**
- Max 124 characters (enforced via `maxlength`)
- Paste disabled (`@paste.prevent`) to encourage natural typing and deter bot submissions
- Live character counter, turns orange at 100+

Modal auto-closes 1.6 seconds after successful submission. Uses `submitIssue(pageKey, category, comment)` from `pulse/index.ts`. Stored in `projects/learn.kanaksan.com/issues/{autoId}`.

---

## WaffleMenu Integration

Both widgets are accessible from the 9-dot waffle menu in the top navigation bar:

```
Rate Us          🚀  → opens RatingWidget modal
Report an issue  🪲  → opens ReportIssue modal
```

Components are lazy-loaded via `defineAsyncComponent` and rendered via `<Teleport to="body">` to ensure correct z-index stacking above all page content.

---

## Firestore Security Rules

Deployed from `C:\MyApps\pulse.kanaksan.com\firestore.rules`.

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| `visitors/{fp}` | ✗ | ✓ (32-char ID, firstSeen+lastSeen required) | ✓ (lastSeen only) | ✗ |
| `visitors/{fp}/projects/{id}` | ✗ | ✓ | ✓ (lastSeen only) | ✗ |
| `visitors/{fp}/projects/{id}/pages/{key}` | ✗ | ✓ | ✓ (lastSeen only) | ✗ |
| `projects/{id}/stats/global` | ✓ | ✓ | ✓ (stat fields only) | ✗ |
| `projects/{id}/pages/{key}` | ✓ | ✓ | ✓ (total+unique only) | ✗ |
| `projects/{id}/ratings/{autoId}` | ✗ | ✓ (score 1–5 validated) | ✗ | ✗ |
| `projects/{id}/issues/{autoId}` | ✗ | ✓ (category+comment strings) | ✗ | ✗ |
| everything else | ✗ | ✗ | ✗ | ✗ |

**Deploy rules:**
```bash
cd C:\MyApps\pulse.kanaksan.com
firebase deploy --only firestore:rules
```

---

## Viewing Analytics in Firebase Console

Navigate to: [Firebase Console → pulse-kanaksan → Firestore](https://console.firebase.google.com/project/pulse-kanaksan/firestore/databases/-default-/data)

| What to check | Firestore path |
|---|---|
| Overall stats | `projects/learn.kanaksan.com/stats/global` |
| Per-page stats | `projects/learn.kanaksan.com/pages/{pageKey}` |
| Ratings | `projects/learn.kanaksan.com/ratings` |
| Bug reports | `projects/learn.kanaksan.com/issues` |

Stats update within a few seconds of each page visit.

---

## .gitignore

Confirmed entries in `C:\MyApps\learn.kanaksan.com\.gitignore`:

```
.env
.env.*
!.env.example
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
```

The `.env.example` template is committed with all `VITE_PULSE_*` keys and empty values.
