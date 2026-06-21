<template>
  <div class="chapter-page">
    <div class="page-inner">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span class="sep">›</span>
        <NuxtLink to="/chapters">Chapters</NuxtLink>
        <span class="sep">›</span>
        <span>{{ chapterData?.title }}</span>
      </nav>

      <div v-if="chapterData" class="chapter-header">
        <span class="ch-icon">{{ masterChapter?.icon }}</span>
        <div class="ch-header-text">
          <h1 class="chapter-title">{{ chapterData.title }}</h1>
          <p class="chapter-desc">{{ chapterData.description }}</p>
        </div>
      </div>

      <h2 class="lessons-heading">Lessons in this chapter</h2>

      <!-- Lesson cards grid -->
      <div v-if="chapterData?.lessons" class="lessons-grid">
        <NuxtLink
          v-for="(lesson, i) in chapterData.lessons"
          :key="lesson.slug"
          :to="`/chapters/${chapterSlug}/${lesson.slug}`"
          class="lesson-card"
        >
          <!-- Image placeholder -->
          <div class="lesson-thumb" :style="thumbStyle(i)">
            <span class="thumb-icon">{{ masterChapter?.icon ?? '⚛' }}</span>
            <span class="thumb-num">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>

          <!-- Card body -->
          <div class="lesson-body">
            <span class="lesson-num-badge">Lesson {{ i + 1 }}</span>
            <h3 class="lesson-title">{{ lesson.title }}</h3>
            <span class="lesson-cta">Start →</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Skeleton -->
      <div v-else class="lessons-grid">
        <div v-for="i in 5" :key="i" class="lesson-skeleton" />
      </div>

      <!-- Chapter prev/next -->
      <div class="chapter-nav">
        <NuxtLink
          v-if="prevChapter"
          :to="`/chapters/${prevChapter.slug}`"
          :title="`← Ch. ${prevChapter.num}: ${prevChapter.title}`"
          class="nav-btn nav-btn--prev"
        >← Ch. {{ prevChapter.num }}: {{ prevChapter.title }}</NuxtLink>
        <NuxtLink
          v-if="nextChapter"
          :to="`/chapters/${nextChapter.slug}`"
          :title="`Ch. ${nextChapter.num}: ${nextChapter.title} →`"
          class="nav-btn nav-btn--next"
        >Ch. {{ nextChapter.num }}: {{ nextChapter.title }} →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, ChapterIndex } from '~/types/physics'

const route = useRoute()
const chapterSlug = route.params.chapter as string

const { data: chapterData } = await useAsyncData(`chapter-${chapterSlug}`, () =>
  $fetch<ChapterIndex>(`/data/chapters/${chapterSlug}/index.json`)
)

const { data: allChapters } = await useAsyncData('chapters', () =>
  $fetch<Chapter[]>('/data/chapters.json')
)

const masterChapter = computed(() =>
  allChapters.value?.find((c) => c.slug === chapterSlug)
)

const chapterIdx = computed(() =>
  allChapters.value?.findIndex((c) => c.slug === chapterSlug) ?? -1
)
const prevChapter = computed(() =>
  chapterIdx.value > 0 ? allChapters.value![chapterIdx.value - 1] : null
)
const nextChapter = computed(() =>
  chapterIdx.value >= 0 && chapterIdx.value < (allChapters.value?.length ?? 0) - 1
    ? allChapters.value![chapterIdx.value + 1]
    : null
)

// Cycle through a palette of gradient pairs for the thumb
const PALETTES = [
  ['#2f6fd0', '#5a92e0'],
  ['#7c3aed', '#a78bfa'],
  ['#059669', '#34d399'],
  ['#d97706', '#fbbf24'],
  ['#db2777', '#f472b6'],
  ['#0891b2', '#22d3ee'],
]
function thumbStyle(i: number) {
  const [from, to] = PALETTES[i % PALETTES.length]
  return `background: linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}

useSeoMeta({
  title: () => `${chapterData.value?.title ?? ''} — Physics Companion`,
  description: () => chapterData.value?.description ?? '',
})
</script>

<style scoped>
.chapter-page {
  padding: 24px 16px 60px;
}
.page-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 0.8rem;
  color: var(--c-text-3);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.breadcrumb a { color: var(--c-brand); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { color: var(--c-text-3); }

.chapter-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}
.ch-icon { font-size: 2.2rem; flex-shrink: 0; margin-top: 4px; }
.ch-header-text { flex: 1; min-width: 0; }

.chapter-title {
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
}
.chapter-desc {
  font-size: 0.92rem;
  color: var(--c-text-2);
  line-height: 1.6;
  margin: 0;
}

.lessons-heading {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 16px;
}

/* Card grid — mobile first */
.lessons-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 40px;
}
@media (min-width: 480px) {
  .lessons-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .lessons-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

/* Individual lesson card */
.lesson-card {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: var(--c-text-1);
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.lesson-card:hover {
  border-color: var(--c-brand);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--c-brand) 14%, transparent);
  transform: translateY(-3px);
  text-decoration: none;
}

/* Image placeholder */
.lesson-thumb {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.lesson-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
}
.thumb-icon {
  font-size: 2.4rem;
  opacity: 0.35;
  position: relative;
  z-index: 1;
}
.thumb-num {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 1.8rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.25);
  line-height: 1;
  z-index: 1;
  letter-spacing: -0.04em;
}

/* Card text area */
.lesson-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.lesson-num-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--c-brand);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.lesson-title {
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
  color: var(--c-text-1);
}
.lesson-cta {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--c-brand);
  margin-top: auto;
  padding-top: 6px;
}
.lesson-card:hover .lesson-cta { text-decoration: underline; }

/* Skeleton */
.lesson-skeleton {
  height: 200px;
  background: var(--c-bg-elv);
  border-radius: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Chapter prev/next */
.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--c-divider);
  padding-top: 24px;
  flex-wrap: wrap;
}
.nav-btn {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--c-brand);
  text-decoration: none;
  padding: 8px 14px;
  border: 1px solid var(--c-divider);
  border-radius: 8px;
  transition: border-color 0.15s, background 0.15s;
  max-width: 48%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-btn:hover {
  border-color: var(--c-brand);
  background: color-mix(in srgb, var(--c-brand) 5%, var(--c-bg));
  text-decoration: none;
}
.nav-btn--next { margin-left: auto; }

@media (max-width: 479px) {
  .chapter-page { padding: 16px 14px 40px; }
  .chapter-header { flex-direction: column; gap: 8px; }
  .nav-btn { max-width: 100%; width: 100%; font-size: 0.75rem; }
  .nav-btn--next { margin-left: 0; }
  .chapter-nav { flex-direction: column; }
}
</style>
