# Physics Companion — Nuxt 3 App Migration Plan

**Target folder:** `C:\MyApps\edu.kanaksan.com\ebooks\physics-app`  
**Current stack:** VitePress 1.6.3 (markdown-based static site)  
**Target stack:** Nuxt 3 + NuxtUI + TypeScript + JSON data files

---

## 1. Why Nuxt 3 over VitePress

| Concern | VitePress | Nuxt 3 |
|---|---|---|
| Content editing | Markdown files | JSON files (structured, validatable) |
| Dynamic features | Limited | Full Vue 3 reactivity |
| Component complexity | Workarounds needed | First-class |
| Routing | File-based (md) | File-based (vue) |
| SEO | Good (static) | Excellent (SSG or SSR) |
| UI components | Manual | NuxtUI (ready-made) |
| Dark mode | VitePress default | NuxtUI built-in |
| Animations | Works | Works (same libs) |
| Deployment | Vercel static | Vercel static (SSG) |

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Nuxt 3 (latest) | SSG output, file routing, auto-imports |
| UI | NuxtUI v2 | Tailwind + Headless UI, dark mode, well-maintained |
| Language | TypeScript | Data model safety, IDE support |
| CSS | Tailwind (via NuxtUI) + scoped CSS | Utility classes + custom animations |
| State | `useState` / Pinia (if needed) | Quiz state, sidebar state |
| 3D scenes | Three.js r184 | FeelHero: dimensional analysis, balance scale, etc. |
| 2D physics | Matter.js | Replaces WASM — see Section 2a |
| Icons | `@nuxt/icon` (Heroicons) | Consistent icon system |
| SEO | `@nuxtjs/seo` | Meta, OG, sitemap, robots |
| Deployment | Vercel (static preset) | Same as current |

---

## 2a. Why Matter.js Replaces the WASM Binary

The existing VitePress site uses a custom `.wasm` binary for interactive 2D simulations (projectile motion, SI units bar chart, etc.). This has several problems in a Nuxt context:

- **Opaque binary** — can't modify, debug, or extend without the original source
- **Loading complexity** — requires `SharedArrayBuffer`, COOP/COEP headers on Vercel
- **Not tree-shakable** — full binary loads regardless of which scene is needed
- **No TypeScript types** — no IDE support, manual memory management

### Alternatives evaluated

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Keep WASM binary | Zero rewrite | Opaque, headers needed, not portable | ❌ Drop |
| Rapier2D (WASM) | Fast rigid-body physics | Still WASM, overkill for edu use | ❌ Skip |
| **Matter.js** | Pure JS, interactive, mouse support, Vue-friendly | No 3D | ✅ **Use this** |
| p5.js | Simple API, large community | Not physics-native, larger bundle | 🟡 Fallback |
| Canvas 2D + math | Zero deps, full control | More boilerplate per scene | 🟡 For custom charts |
| Three.js (2D mode) | Already a dep | Overkill for flat 2D scenes | 🟡 Only for 3D |

### Matter.js covers all current WASM scenes

| Current WASM scene | Matter.js replacement |
|---|---|
| Projectile motion | `Matter.Body`, gravity, trajectory trail on Canvas |
| SI units bar chart | Canvas 2D (no physics needed — just animated bars) |
| Significant figures | Canvas 2D (bar heights, color coding) |
| Dimensional analysis | Matter.js balance scale with constraints |
| Pendulum | Matter.js `Constraint` + `Body` (accurate pendulum) |
| Newton's cradle | Matter.js classic example (built into their docs) |
| Spring oscillation | Matter.js `Constraint` with stiffness |
| Circular motion | Canvas 2D + `requestAnimationFrame` (pure math) |

### Installation

```bash
npm install matter-js
npm install -D @types/matter-js
```

### Vue 3 usage pattern

```typescript
// composables/useMatterScene.ts
import { onMounted, onUnmounted, ref } from 'vue'

export function useMatterScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  let engine: Matter.Engine | null = null
  let runner: Matter.Runner | null = null
  let render: Matter.Render | null = null

  onMounted(async () => {
    const Matter = await import('matter-js')   // lazy import — only loads when scene mounts
    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter

    engine = Engine.create({ gravity: { y: 1 } })
    render = Render.create({
      canvas: canvasRef.value!,
      engine,
      options: { width: 600, height: 400, wireframes: false, background: 'transparent' }
    })
    runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)
  })

  onUnmounted(() => {
    if (render) Matter.Render.stop(render)
    if (runner) Matter.Runner.stop(runner)
    if (engine) Matter.Engine.clear(engine)
  })
}
```

### Component structure

```
components/Explore/
  ExploreHero.vue          ← replaces WasmHero; dispatches by scene type
  scenes/
    ProjectileScene.vue    ← Matter.js + mouse-drag launch
    PendulumScene.vue      ← Matter.js Constraint
    NewtonsCradleScene.vue ← Matter.js (classic)
    SpringScene.vue        ← Matter.js Constraint stiffness
    SiUnitsScene.vue       ← Canvas 2D bar chart (no physics)
    CircularScene.vue      ← Canvas 2D math
```

### Key advantage: interactivity

Matter.js supports `Matter.MouseConstraint` — users can drag and launch projectiles, pull a pendulum, push balls in Newton's cradle. This is richer than the current WASM binary which only animates without user interaction.

---

## 3. Folder Structure

```
physics-app/
├── app.vue
├── nuxt.config.ts
├── tailwind.config.ts
│
├── data/                          ← ALL content lives here
│   ├── site.json                  ← site name, tagline, exam tags
│   ├── chapters.json              ← chapter list (num, title, slug, icon, status)
│   └── chapters/
│       ├── ch01-physical-world/
│       │   ├── index.json         ← chapter overview, description
│       │   └── lessons/
│       │       ├── what-is-physics.json
│       │       └── scope-of-physics.json
│       ├── ch02-units-measurement/
│       │   ├── index.json
│       │   └── lessons/
│       │       ├── si-units.json
│       │       ├── significant-figures.json
│       │       ├── dimensions.json
│       │       └── dimensional-analysis.json
│       └── ... (ch03 – ch15)
│
├── pages/
│   ├── index.vue                  ← HomeLanding
│   ├── chapters/
│   │   ├── index.vue              ← Chapter list grid
│   │   └── [chapter]/
│   │       ├── index.vue          ← Chapter overview
│   │       └── [lesson].vue       ← Lesson page
│   └── about.vue
│
├── components/
│   ├── App/
│   │   ├── AppNav.vue             ← Top navbar
│   │   ├── AppSidebar.vue         ← Collapsible sidebar
│   │   └── AppFooter.vue
│   ├── Home/
│   │   ├── HomeLanding.vue
│   │   ├── HeroSection.vue
│   │   ├── PhysicsAnim.vue        ← 10 SVG animations (port from VitePress)
│   │   ├── FeatureCards.vue
│   │   └── ChapterGrid.vue
│   ├── Lesson/
│   │   ├── ConceptHero.vue        ← Watch / Explore / Feel tabs
│   │   ├── WasmHero.vue           ← WASM canvas widget
│   │   ├── FeelHero.vue           ← Three.js scenes
│   │   ├── ConceptBlock.vue       ← idea / formula / real / try blocks
│   │   ├── QuizBlock.vue          ← inline quiz
│   │   └── ConceptMeta.vue        ← title + exam tags
│   └── Shared/
│       ├── SidebarToggle.vue
│       └── ExamBadge.vue
│
├── composables/
│   ├── useChapter.ts              ← load chapter JSON
│   ├── useLesson.ts               ← load lesson JSON
│   └── useSidebar.ts              ← open/close state (localStorage)
│
├── types/
│   └── physics.ts                 ← TypeScript interfaces for all JSON shapes
│
└── public/
    ├── wasm/                      ← existing .wasm binaries
    └── og/                        ← OG images
```

---

## 4. JSON Data Models

### `data/chapters.json`
```json
[
  {
    "num": 1,
    "slug": "ch01-physical-world",
    "title": "Physical World",
    "icon": "🌌",
    "status": "draft",
    "lessonCount": 2
  },
  {
    "num": 2,
    "slug": "ch02-units-measurement",
    "title": "Units & Measurement",
    "icon": "📐",
    "status": "published",
    "lessonCount": 4
  }
]
```

### `data/chapters/ch02-units-measurement/lessons/si-units.json`
```json
{
  "slug": "si-units",
  "title": "SI Units",
  "subtitle": "The 7 base units that measure everything in the universe",
  "chapter": "ch02-units-measurement",
  "order": 1,
  "examTags": ["JEE Main", "KCET"],
  "visualType": "si-units",
  "hasWasm": true,
  "hasFeel": true,
  "blocks": [
    {
      "type": "idea",
      "heading": "Why do we need standard units?",
      "body": "Imagine buying 5 metres of cloth in India and 5 metres in the UK — both mean the same thing because we agreed on what a metre is. That agreement is SI."
    },
    {
      "type": "formula",
      "heading": "The 7 SI Base Units",
      "body": "Length (m) · Mass (kg) · Time (s) · Current (A) · Temperature (K) · Amount (mol) · Luminosity (cd)"
    },
    {
      "type": "real",
      "heading": "Real life",
      "body": "GPS satellites use SI units for timing signals accurate to nanoseconds. A 1 µs error = 300 m position error."
    },
    {
      "type": "try",
      "heading": "Home experiment",
      "body": "Measure your height in cm, then convert to metres, then to km. Notice how the number changes but you don't."
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Which SI unit measures electric current?",
      "options": ["Volt", "Ampere", "Watt", "Ohm"],
      "answer": 1,
      "explanation": "Ampere (A) is the SI base unit for electric current."
    },
    {
      "id": "q2",
      "question": "How many base SI units are there?",
      "options": ["5", "6", "7", "9"],
      "answer": 2,
      "explanation": "There are exactly 7 SI base units defined by the International System of Units."
    }
  ]
}
```

### TypeScript types (`types/physics.ts`)
```typescript
export interface Chapter {
  num: number
  slug: string
  title: string
  icon: string
  status: 'published' | 'draft' | 'coming-soon'
  lessonCount: number
}

export type BlockType = 'idea' | 'formula' | 'real' | 'try' | 'whatif'

export interface ConceptBlock {
  type: BlockType
  heading: string
  body: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answer: number          // index
  explanation: string
}

export interface Lesson {
  slug: string
  title: string
  subtitle: string
  chapter: string
  order: number
  examTags: string[]
  visualType?: string     // maps to ConceptHero/FeelHero scene
  hasWasm?: boolean
  hasFeel?: boolean
  blocks: ConceptBlock[]
  quiz: QuizQuestion[]
}
```

---

## 5. Page & Route Design

### `/` — HomeLanding
- Same design as current VitePress HomeLanding.vue
- Random physics animation (10 SVG scenes)
- Feature cards
- Chapter grid (links to `/chapters/[slug]`)

### `/chapters/` — Chapter List
- Grid of 15 chapter cards
- Status badge (published / coming soon)
- Click → `/chapters/ch02-units-measurement/`

### `/chapters/[chapter]/` — Chapter Overview
- Chapter title, icon, description
- List of lessons in this chapter
- Progress indicator (future)

### `/chapters/[chapter]/[lesson]` — Lesson Page
- `ConceptMeta` (title, exam badges)
- `ConceptHero` (Watch / Explore / Feel tabs)
- All `ConceptBlock` entries from JSON
- `QuizBlock` at the bottom
- Prev / Next lesson navigation

---

## 6. AppSidebar Design

Replaces VitePress's built-in sidebar. Full control over:
- Accordion per chapter (expand/collapse)
- Active lesson highlight
- Toggle button (same as current SidebarToggle)
- State persisted via `useSidebar` composable (localStorage)
- Mobile: slide-in drawer

```typescript
// composables/useSidebar.ts
export function useSidebar() {
  const open = useState('sidebar', () => true)

  function toggle() {
    open.value = !open.value
    localStorage.setItem('pc-sidebar', open.value ? 'open' : 'closed')
  }

  function init() {
    if (import.meta.client) {
      open.value = localStorage.getItem('pc-sidebar') !== 'closed'
    }
  }

  return { open, toggle, init }
}
```

---

## 7. NuxtUI Components to Use

| Need | NuxtUI Component |
|---|---|
| Dark/light toggle | `UColorModeButton` |
| Sidebar nav items | `UVerticalNavigation` |
| Chapter cards | `UCard` |
| Quiz options | `URadioGroup` |
| Exam badges | `UBadge` |
| Quiz feedback alert | `UAlert` |
| Page breadcrumb | `UBreadcrumb` |
| Mobile sidebar | `UDrawer` (or `USlideover`) |
| Loading states | `USkeleton` |
| Prev/Next nav | `UButton` with icon |

---

## 8. ConceptHero Port

The Watch / Explore / Feel tab widget ports directly:

- **Watch** → SVG (inline in lesson JSON or component by `visualType`)
- **Explore** → `WasmHero.vue` (reuse existing WASM binary from `public/wasm/`)
- **Feel** → `FeelHero.vue` (reuse Three.js scenes, dispatch by `visualType`)
- Tab state: `ref<'watch'|'explore'|'feel'>` — same toggle/collapse logic
- Fullscreen: same CSS approach

---

## 9. Development Phases

### Phase 1 — Scaffold (Day 1)
```bash
npx nuxi@latest init physics-app
cd physics-app
npx nuxi module add ui              # NuxtUI (Tailwind + dark mode)
npx nuxi module add icon            # Nuxt Icon
npx nuxi module add @nuxtjs/seo
npm install three @types/three      # Three.js for 3D Feel scenes
npm install matter-js               # 2D physics — replaces WASM
npm install -D @types/matter-js
```
- `nuxt.config.ts` — ssr: false (SSG), colorMode, tailwind
- `app.vue` with `AppNav`, `AppSidebar`, `<NuxtPage>`, `AppFooter`
- `tailwind.config.ts` — extend colors to match current brand (`#2f6fd0`)
- No WASM binary, no COOP/COEP headers needed

### Phase 2 — Data layer (Day 1–2)
- Write all JSON files for Ch 01 and Ch 02 (4 lessons)
- `types/physics.ts` — full TypeScript interfaces
- `composables/useChapter.ts`, `useLesson.ts` using `$fetch` or `useAsyncData`
- Validate JSON against types with a Node script

### Phase 3 — Core pages (Day 2–3)
- `pages/index.vue` — HomeLanding with PhysicsAnim
- `pages/chapters/index.vue` — Chapter grid
- `pages/chapters/[chapter]/index.vue` — Chapter overview
- `pages/chapters/[chapter]/[lesson].vue` — Lesson page (blocks + quiz)

### Phase 4 — Components (Day 3–5)
- `AppSidebar.vue` — accordion, toggle, mobile drawer
- `ConceptBlock.vue` — 5 block types with icons + colors
- `QuizBlock.vue` — radio group, submit, reveal answer
- `ConceptHero.vue` — Watch/Explore/Feel tabs (port from VitePress)
- `WasmHero.vue` + `FeelHero.vue` — direct port
- `PhysicsAnim.vue` — 10 SVG animations (direct port)

### Phase 5 — Polish (Day 5–6)
- Dark mode (NuxtUI `useColorMode`)
- SEO — `useSeoMeta` per lesson (title, description, OG)
- Mobile sidebar drawer
- Prev/Next lesson navigation
- `sitemap.xml` via `@nuxtjs/seo`

### Phase 6 — Deploy (Day 6–7)
```bash
# nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,        // or true for SSR
  nitro: { preset: 'vercel-static' }
})
```
- Push to GitHub
- Link to Vercel → auto-deploys on push
- DNS: `physics.kanaksan.com` → Vercel

---

## 10. Key Differences from VitePress

| Feature | VitePress approach | Nuxt approach |
|---|---|---|
| Content | `.md` frontmatter | `.json` files |
| Sidebar | Config in `.vitepress/config` | `AppSidebar.vue` reads `chapters.json` |
| Dark mode | CSS vars + VitePress toggle | `useColorMode()` from NuxtUI |
| Accordion | `MutationObserver` hack | Direct Vue state in `AppSidebar` |
| Sidebar toggle | Body class + CSS var override | `useSidebar` composable |
| SEO | Manual OG meta in config | `useSeoMeta` per page |
| Quiz | Vue component in markdown | `QuizBlock` reads from lesson JSON |
| WASM | Public folder import | Same (`public/wasm/`) |

---

## 11. Commands to Run

```bash
# 1. Create the app
cd C:\MyApps\edu.kanaksan.com\ebooks
npx nuxi@latest init physics-app
cd physics-app

# 2. Add modules
npx nuxi module add ui
npx nuxi module add icon
npx nuxi module add @nuxtjs/seo

# 3. Install Three.js
npm install three @types/three

# 4. Dev server
npm run dev

# 5. Build static
npm run generate

# 6. Preview build
npm run preview
```

---

## 12. nuxt.config.ts Skeleton

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,                    // static site generation

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtjs/seo',
  ],

  ui: {
    colorMode: true,
  },

  app: {
    head: {
      title: 'Physics Companion — Class 11',
      meta: [
        { name: 'description', content: 'Free Class 11 Physics — concept first, formula second.' }
      ]
    }
  },

  nitro: {
    preset: 'vercel-static',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    }
  },

  tailwind: {
    config: {
      theme: {
        extend: {
          colors: {
            brand: { DEFAULT: '#2f6fd0', light: '#5a92e0' }
          }
        }
      }
    }
  }
})
```

---

*Document created: 2025 · Physics Companion Migration Plan*
