// ── Chapter ──────────────────────────────────────────────────────────────────
export interface Chapter {
  num: number
  slug: string
  title: string
  icon: string
  status: 'published' | 'draft' | 'coming-soon'
  lessonCount: number
  description?: string
}

// ── Lesson index entry (inside chapter index.json) ───────────────────────────
export interface LessonRef {
  slug: string
  title: string
  order: number
}

// ── Chapter index ─────────────────────────────────────────────────────────────
export interface ChapterIndex {
  slug: string
  title: string
  icon: string
  description: string
  lessons: LessonRef[]
}

// ── Concept Blocks ────────────────────────────────────────────────────────────
export type BlockType = 'idea' | 'formula' | 'real' | 'try' | 'whatif'

export interface ConceptBlock {
  type: BlockType
  heading: string
  body: string        // supports basic markdown-like formatting
  latex?: string      // optional LaTeX expression
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answer: number      // 0-based index of correct answer
  explanation: string
}

// ── Lesson ────────────────────────────────────────────────────────────────────
export interface Lesson {
  slug: string
  title: string
  subtitle: string
  chapter: string      // chapter slug, e.g. "ch02-units-measurement"
  order: number
  examTags: string[]   // e.g. ["JEE Main", "KCET"]
  visualType?: string  // scene id for ConceptHero: "si-units", "dimensional-analysis" …
  /** Experiment component name resolved by useExperimentRegistry (e.g. "InertiaExperiment"). */
  experiment?: string
  hasWasm?: boolean
  hasFeel?: boolean
  blocks: ConceptBlock[]
  quiz: QuizQuestion[]
  // optional metadata
  ncertChapter?: number
  ncertSection?: string
  ncertPage?: string
}

// ── Site metadata ─────────────────────────────────────────────────────────────
export interface SiteConfig {
  name: string
  tagline: string
  examTags: string[]
  url: string
}
