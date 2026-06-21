<template>
  <div class="lesson-page">
    <div class="lesson-inner">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span class="sep">›</span>
        <NuxtLink to="/chapters">Chapters</NuxtLink>
        <span class="sep">›</span>
        <NuxtLink :to="`/chapters/${chapterSlug}`">{{ chapterIndex?.title }}</NuxtLink>
        <span class="sep">›</span>
        <span>{{ lesson?.title }}</span>
      </nav>

      <template v-if="lesson">
        <!-- Meta header -->
        <ConceptMeta
          :title="lesson.title"
          :subtitle="lesson.subtitle"
          :exam-tags="lesson.examTags"
          :ncert-chapter="lesson.ncertChapter"
          :ncert-section="lesson.ncertSection"
          :ncert-page="lesson.ncertPage"
        />

        <!-- Visualise -->
        <ConceptHero v-if="lesson.visualType" :type="lesson.visualType" />

        <!-- Concept blocks -->
        <div class="blocks">
          <ConceptBlock
            v-for="(block, i) in lesson.blocks"
            :key="i"
            :block="block"
          />
        </div>

        <!-- Interactive experiment (lazy-loaded, client-only) -->
        <ClientOnly v-if="experimentComponent">
          <component :is="experimentComponent" />
          <template #fallback>
            <div class="exp-skeleton-wrap">
              <div class="exp-skeleton" />
            </div>
          </template>
        </ClientOnly>

        <!-- Quiz -->
        <QuizBlock v-if="lesson.quiz?.length" :questions="lesson.quiz" />

        <!-- Prev / Next lesson navigation -->
        <nav class="lesson-nav" v-if="chapterIndex">
          <NuxtLink
            v-if="prevLesson"
            :to="`/chapters/${chapterSlug}/${prevLesson.slug}`"
            :title="prevLesson.title"
            class="nav-btn nav-btn--prev"
          >← {{ prevLesson.title }}</NuxtLink>
          <NuxtLink
            v-if="nextLesson"
            :to="`/chapters/${chapterSlug}/${nextLesson.slug}`"
            :title="nextLesson.title"
            class="nav-btn nav-btn--next"
          >{{ nextLesson.title }} →</NuxtLink>
        </nav>
      </template>

      <!-- Loading / error -->
      <div v-else-if="error" class="error-state">
        <p>⚠️ Could not load this lesson. <NuxtLink :to="`/chapters/${chapterSlug}`">Go back to chapter</NuxtLink></p>
      </div>
      <div v-else class="loading-state">
        <div v-for="i in 4" :key="i" class="block-skeleton" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lesson, ChapterIndex } from '~/types/physics'

// ── Experiment registry ───────────────────────────────────────────────────────
const { resolve: resolveExperiment } = useExperimentRegistry()

const route = useRoute()
const chapterSlug = route.params.chapter as string
const lessonSlug = route.params.lesson as string

const { data: lesson, error } = await useAsyncData(
  `lesson-${chapterSlug}-${lessonSlug}`,
  () => $fetch<Lesson>(`/data/chapters/${chapterSlug}/lessons/${lessonSlug}.json`)
)

const { data: chapterIndex } = await useAsyncData(
  `chapter-${chapterSlug}`,
  () => $fetch<ChapterIndex>(`/data/chapters/${chapterSlug}/index.json`)
)

// Prev / next within this chapter
const lessonIdx = computed(() =>
  chapterIndex.value?.lessons.findIndex((l) => l.slug === lessonSlug) ?? -1
)
const prevLesson = computed(() =>
  lessonIdx.value > 0 ? chapterIndex.value!.lessons[lessonIdx.value - 1] : null
)
const nextLesson = computed(() =>
  lessonIdx.value >= 0 && lessonIdx.value < (chapterIndex.value?.lessons.length ?? 0) - 1
    ? chapterIndex.value!.lessons[lessonIdx.value + 1]
    : null
)

// Resolve experiment component lazily (null if no experiment or not registered)
const experimentComponent = computed(() =>
  resolveExperiment(lesson.value?.experiment)
)

useSeoMeta({
  title: () => lesson.value ? `${lesson.value.title} — Physics Companion` : 'Physics Companion',
  description: () => lesson.value?.subtitle ?? '',
})
</script>

<style scoped>
.lesson-page {
  padding: 28px 20px 64px;
}
.lesson-inner {
  max-width: 820px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 0.8rem;
  color: var(--c-text-3);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.breadcrumb a { color: var(--c-brand); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { color: var(--c-text-3); }

.blocks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

/* Prev / Next nav */
.lesson-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--c-divider);
  padding-top: 28px;
  margin-top: 16px;
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

/* Experiment SSR fallback skeleton */
.exp-skeleton-wrap {
  margin: 32px 0;
  border: 1px solid var(--c-divider);
  border-radius: 16px;
  overflow: hidden;
}
.exp-skeleton {
  height: 360px;
  background: var(--c-bg-elv);
  animation: pulse 1.5s ease-in-out infinite;
}

/* Loading skeletons */
.block-skeleton {
  height: 100px;
  background: var(--c-bg-elv);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.error-state, .loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.error-state p {
  color: var(--c-text-2);
  font-size: 0.95rem;
}

@media (max-width: 480px) {
  .lesson-page { padding: 16px 14px 48px; }
  .nav-btn { font-size: 0.75rem; max-width: 100%; width: 100%; }
  .nav-btn--next { margin-left: 0; }
  .lesson-nav { flex-direction: column; }
}
</style>
