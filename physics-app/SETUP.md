# Physics Companion — Nuxt 3 Setup

## First-time setup

```bat
cd C:\MyApps\edu.kanaksan.com\11PHYPUKA\physics-app
npm install
npm run dev
```

Then open http://localhost:3000

## Regenerate JSON from source markdown

Run any time after editing files in `docs/chapters/`:

```bat
python scripts/parse_md_to_json.py
```

Outputs to `public/data/` — no restart needed, just refresh.

## Build for production

```bat
npm run build
```

## Deploy to Vercel

Push `physics-app/` (not the monorepo root) to GitHub, then in Vercel:

- **Framework preset**: Nuxt.js
- **Root directory**: `physics-app`
- **Build command**: `npm run build`
- **Output directory**: `.output/public`

`vercel.json` is already included.

## Project structure

```
physics-app/
├── app.vue                     ← root layout (nav + sidebar + page + footer)
├── nuxt.config.ts
├── vercel.json
│
├── public/data/                ← ALL content served as static JSON
│   ├── chapters.json           ← 15 chapter summaries
│   └── chapters/
│       ├── ch01-physical-world/
│       │   ├── index.json      ← lesson list (1 lesson, draft)
│       │   └── lessons/what-is-physics.json
│       ├── ch02-units-measurement/ … ch15-waves/
│       │   ├── index.json
│       │   └── lessons/*.json  ← 74 lessons, 383 concept blocks
│
├── pages/
│   ├── index.vue               ← Home (hero + features)
│   ├── chapters/
│   │   ├── index.vue           ← Chapter grid (all 15)
│   │   └── [chapter]/
│   │       ├── index.vue       ← Chapter overview + lesson list
│   │       └── [lesson].vue    ← Full lesson (blocks + quiz)
│
├── components/
│   ├── App/AppNav.vue          ← Sticky nav + dark-mode toggle
│   ├── App/AppSidebar.vue      ← Accordion sidebar (lazy loads lessons)
│   ├── App/AppFooter.vue
│   ├── Home/PhysicsAnim.vue    ← SVG physics animations
│   ├── Lesson/ConceptMeta.vue  ← Title + exam badges + NCERT ref
│   ├── Lesson/ConceptBlock.vue ← Idea / Formula / Real / Try / WhatIf
│   └── Lesson/QuizBlock.vue    ← Self-marking quiz
│
├── composables/
│   ├── useAppI18n.ts           ← t('key') lookup — wire new locales here
│   ├── useChapter.ts
│   ├── useLesson.ts
│   └── useSidebar.ts
│
├── i18n/locales/en.json        ← All UI strings (English only for now)
├── types/physics.ts            ← TypeScript interfaces for all JSON shapes
└── scripts/parse_md_to_json.py ← VitePress MD → JSON parser
```

## Adding / updating a lesson

1. Edit the source markdown in `docs/chapters/`
2. Run `python scripts/parse_md_to_json.py`
3. Commit `public/data/`

## Adding i18n for a new locale

1. Copy `i18n/locales/en.json` → `i18n/locales/kn.json` (Kannada, etc.)
2. In `composables/useAppI18n.ts`, add a locale ref and import the new file
3. Switch `messages` based on `locale.value`

## Dark mode

Works via `useColorMode()` from NuxtUI. CSS custom properties in `app.vue` handle the theme.
