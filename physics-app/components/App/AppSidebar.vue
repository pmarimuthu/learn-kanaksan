<template>
  <aside class="sidebar" :class="{ 'sidebar--open': open }">
    <div class="sidebar-inner">

      <!-- ── Part I ── -->
      <div class="part-label">Part I — Mechanics</div>

      <div v-for="ch in part1" :key="ch.slug" class="ch-group">
        <button
          class="ch-header"
          :class="{ 'ch-header--active': isActiveChapter(ch.slug) }"
          @click="toggleCollapse(ch.slug)"
        >
          <span class="ch-icon">{{ ch.icon }}</span>
          <span class="ch-info">
            <span class="ch-num">Ch {{ ch.num }}</span>
            <span class="ch-title">{{ ch.title }}</span>
          </span>
          <svg class="ch-chevron" :class="{ 'ch-chevron--open': !collapsed[ch.slug] }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="lessons">
          <div v-show="!collapsed[ch.slug]" class="lesson-list">
            <template v-if="allLessons[ch.slug]">
              <NuxtLink
                v-for="lesson in allLessons[ch.slug]"
                :key="lesson.slug"
                :to="`/chapters/${ch.slug}/${lesson.slug}`"
                class="lesson-link"
                :class="{ 'lesson-link--active': isActiveLesson(ch.slug, lesson.slug) }"
                @click="closeMobile"
              >
                <span class="lesson-dot" />
                {{ lesson.title }}
              </NuxtLink>
            </template>
            <div v-else class="lesson-loading">
              <div v-for="i in 4" :key="i" class="lesson-skeleton" />
            </div>
          </div>
        </Transition>
      </div>

      <!-- ── Part II ── -->
      <div class="part-label part-label--2">Part II — Properties &amp; Waves</div>

      <div v-for="ch in part2" :key="ch.slug" class="ch-group">
        <button
          class="ch-header"
          :class="{ 'ch-header--active': isActiveChapter(ch.slug) }"
          @click="toggleCollapse(ch.slug)"
        >
          <span class="ch-icon">{{ ch.icon }}</span>
          <span class="ch-info">
            <span class="ch-num">Ch {{ ch.num }}</span>
            <span class="ch-title">{{ ch.title }}</span>
          </span>
          <svg class="ch-chevron" :class="{ 'ch-chevron--open': !collapsed[ch.slug] }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="lessons">
          <div v-show="!collapsed[ch.slug]" class="lesson-list">
            <template v-if="allLessons[ch.slug]">
              <NuxtLink
                v-for="lesson in allLessons[ch.slug]"
                :key="lesson.slug"
                :to="`/chapters/${ch.slug}/${lesson.slug}`"
                class="lesson-link"
                :class="{ 'lesson-link--active': isActiveLesson(ch.slug, lesson.slug) }"
                @click="closeMobile"
              >
                <span class="lesson-dot" />
                {{ lesson.title }}
              </NuxtLink>
            </template>
            <div v-else class="lesson-loading">
              <div v-for="i in 4" :key="i" class="lesson-skeleton" />
            </div>
          </div>
        </Transition>
      </div>

      <div class="sidebar-footer">Class 11 Physics · Karnataka PU</div>
    </div>
  </aside>

  <!-- Mobile backdrop -->
  <Transition name="overlay">
    <div v-if="open && isMobile" class="overlay" @click="open = false" />
  </Transition>
</template>

<script setup lang="ts">
import type { Chapter, ChapterIndex, LessonRef } from '~/types/physics'

const { open } = useSidebar()
const route = useRoute()

// ── Responsive ────────────────────────────────────────────────────────────────
const isMobile = ref(false)
onMounted(() => {
  const update = () => { isMobile.value = window.innerWidth < 960 }
  update()
  window.addEventListener('resize', update)
})
function closeMobile() { if (isMobile.value) open.value = false }

// ── Chapters list ─────────────────────────────────────────────────────────────
const { data: chapters } = await useAsyncData('chapters', () =>
  $fetch<Chapter[]>('/data/chapters.json')
)

const part1 = computed(() => (chapters.value ?? []).filter(c => c.num <= 8))
const part2 = computed(() => (chapters.value ?? []).filter(c => c.num > 8))

// ── Eager-load all lesson indexes ─────────────────────────────────────────────
const allLessons = ref<Record<string, LessonRef[]>>({})

async function loadAllLessons() {
  const chs = chapters.value
  if (!chs?.length) return
  const results = await Promise.all(
    chs.map(ch =>
      $fetch<ChapterIndex>(`/data/chapters/${ch.slug}/index.json`).catch(() => null)
    )
  )
  const map: Record<string, LessonRef[]> = {}
  chs.forEach((ch, i) => { if (results[i]?.lessons) map[ch.slug] = results[i]!.lessons })
  allLessons.value = map
}

onMounted(loadAllLessons)

// ── Collapse state (per-chapter, persisted) ───────────────────────────────────
const STORE_KEY = 'pc-sidebar-collapsed'
const collapsed = ref<Record<string, boolean>>({})

const activeChapter = computed(() => route.params.chapter as string | undefined)
const activeLesson  = computed(() => route.params.lesson  as string | undefined)

function initCollapse() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}')
    const activeSlug = activeChapter.value
    const state: Record<string, boolean> = {}
    ;(chapters.value ?? []).forEach(ch => {
      // If never saved: active chapter open, others closed
      state[ch.slug] = saved[ch.slug] !== undefined
        ? saved[ch.slug]
        : ch.slug !== activeSlug
    })
    collapsed.value = state
  } catch {
    collapsed.value = {}
  }
}

function toggleCollapse(slug: string) {
  collapsed.value = { ...collapsed.value, [slug]: !collapsed.value[slug] }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(collapsed.value)) } catch {}
}

onMounted(() => {
  initCollapse()
  const { init } = useSidebar()
  init()
})

// Auto-open active chapter on route change
watch(activeChapter, slug => {
  if (slug && collapsed.value[slug]) {
    collapsed.value = { ...collapsed.value, [slug]: false }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(collapsed.value)) } catch {}
  }
})

function isActiveChapter(slug: string) { return slug === activeChapter.value }
function isActiveLesson(chSlug: string, lSlug: string) {
  return chSlug === activeChapter.value && lSlug === activeLesson.value
}
</script>

<style scoped>
/* ── Shell ── */
.sidebar {
  position: fixed;
  top: var(--nav-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--c-bg-soft);
  border-right: 1px solid var(--c-divider);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  scrollbar-width: thin;
  scrollbar-color: var(--c-divider) transparent;
}
.sidebar--open { transform: translateX(0); }

.sidebar-inner { padding: 6px 0 48px; }

/* ── Part labels ── */
.part-label {
  padding: 12px 16px 4px;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--c-text-3);
  border-top: 1px solid var(--c-divider);
  margin-top: 6px;
}
.part-label:first-child { border-top: none; margin-top: 0; }
.part-label--2 { margin-top: 10px; }

/* ── Chapter header button ── */
.ch-group { margin-bottom: 1px; }

.ch-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px 7px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.11s;
}
.ch-header:hover { background: var(--c-bg-elv); }
.ch-header--active { background: color-mix(in srgb, var(--c-brand) 7%, transparent); }

.ch-icon { font-size: 1rem; flex-shrink: 0; width: 22px; text-align: center; }

.ch-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.ch-num {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--c-brand);
  line-height: 1;
}
.ch-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--c-text-1);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ch-header--active .ch-title { color: var(--c-brand); }

.ch-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--c-text-3);
  transform: rotate(-90deg);
  transition: transform 0.18s ease;
}
.ch-chevron--open { transform: rotate(0deg); }

/* ── Lesson list ── */
.lesson-list {
  padding: 2px 8px 5px 44px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lesson-link {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 5px 8px;
  font-size: 0.76rem;
  color: var(--c-text-2);
  text-decoration: none;
  border-radius: 6px;
  line-height: 1.35;
  transition: background 0.1s, color 0.1s;
}
.lesson-link:hover { background: var(--c-bg-elv); color: var(--c-text-1); text-decoration: none; }
.lesson-link--active {
  background: color-mix(in srgb, var(--c-brand) 11%, transparent);
  color: var(--c-brand);
  font-weight: 600;
}

.lesson-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-divider);
  flex-shrink: 0;
  margin-top: 6px;
}
.lesson-link--active .lesson-dot { background: var(--c-brand); }

/* skeletons */
.lesson-loading { display: flex; flex-direction: column; gap: 5px; padding: 4px 0; }
.lesson-skeleton { height: 18px; background: var(--c-bg-elv); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }

/* ── Slide transition ── */
.lessons-enter-active, .lessons-leave-active {
  transition: max-height 0.22s ease, opacity 0.16s ease;
  overflow: hidden;
  max-height: 800px;
}
.lessons-enter-from, .lessons-leave-to { max-height: 0; opacity: 0; }

/* ── Footer ── */
.sidebar-footer {
  margin-top: 24px;
  padding: 0 16px;
  font-size: 0.67rem;
  color: var(--c-text-3);
}

/* ── Mobile backdrop ── */
.overlay {
  position: fixed;
  inset: 0;
  top: var(--nav-height);
  background: rgba(0,0,0,0.4);
  z-index: 40;
  backdrop-filter: blur(2px);
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
</style>
