<template>
  <div class="chapters-page">
    <div class="page-inner">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span class="sep">›</span>
        <span>Chapters</span>
      </nav>

      <h1 class="page-title">All Chapters</h1>
      <p class="page-sub">Class 11 Physics — Karnataka PU / NCERT</p>

      <!-- Search -->
      <div class="search-wrap">
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8.5" cy="8.5" r="5.5"/>
            <line x1="13.5" y1="13.5" x2="18" y2="18"/>
          </svg>
        </span>
        <input
          v-model="search"
          class="search-input"
          type="search"
          placeholder="Search chapters…"
          aria-label="Search chapters"
        />
        <button v-if="search" class="search-clear" @click="search = ''" aria-label="Clear search">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <line x1="5" y1="5" x2="15" y2="15"/>
            <line x1="15" y1="5" x2="5" y2="15"/>
          </svg>
        </button>
      </div>

      <!-- Results count when filtering -->
      <p v-if="search && chapters" class="search-count">
        {{ filtered.length }} of {{ chapters.length }} chapters
      </p>

      <div v-if="chapters" class="grid">
        <NuxtLink
          v-for="ch in filtered"
          :key="ch.slug"
          :to="ch.status !== 'coming-soon' ? `/chapters/${ch.slug}` : undefined"
          class="card"
          :class="{ 'card--disabled': ch.status === 'coming-soon' }"
        >
          <div class="card-top">
            <span class="card-icon">{{ ch.icon }}</span>
            <span class="card-num">Ch. {{ ch.num }}</span>
            <span v-if="ch.status === 'coming-soon'" class="badge badge--muted">Coming soon</span>
            <span v-else-if="ch.status === 'published'" class="badge badge--green">{{ ch.lessonCount }} lessons</span>
            <span v-else class="badge badge--amber">Draft</span>
          </div>
          <h2 class="card-title">{{ ch.title }}</h2>
          <p class="card-desc">{{ ch.description }}</p>
          <span v-if="ch.status !== 'coming-soon'" class="card-link">Explore →</span>
        </NuxtLink>

        <!-- No results -->
        <div v-if="filtered.length === 0" class="empty-state">
          <p>No chapters match "<strong>{{ search }}</strong>"</p>
          <button class="clear-btn" @click="search = ''">Clear search</button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-else class="grid">
        <div v-for="i in 15" :key="i" class="card-skeleton" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '~/types/physics'

useSeoMeta({
  title: 'Chapters — Physics Companion',
  description: 'All 15 Class 11 Physics chapters. NCERT · Karnataka PU · JEE · KCET.',
})

const { data: chapters } = await useAsyncData('chapters', () =>
  $fetch<Chapter[]>('/data/chapters.json')
)

const search = ref('')

const filtered = computed(() => {
  if (!chapters.value) return []
  const q = search.value.toLowerCase().trim()
  if (!q) return chapters.value
  return chapters.value.filter(
    (ch) =>
      ch.title.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
.chapters-page {
  padding: 24px 16px 60px;
}
.page-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.breadcrumb {
  font-size: 0.8rem;
  color: var(--c-text-3);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.breadcrumb a { color: var(--c-brand); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { color: var(--c-text-3); }

.page-title {
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0 0 4px;
}
.page-sub {
  font-size: 0.88rem;
  color: var(--c-text-2);
  margin: 0 0 20px;
}

/* Search */
.search-wrap {
  position: relative;
  margin-bottom: 24px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--c-text-3);
  pointer-events: none;
}
.search-icon svg { width: 100%; height: 100%; }
.search-input {
  width: 100%;
  padding: 10px 40px 10px 38px;
  font-size: 0.9rem;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 10px;
  color: var(--c-text-1);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
}
.search-input::placeholder { color: var(--c-text-3); }
.search-input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-brand) 15%, transparent);
}
.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--c-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s;
}
.search-clear:hover { color: var(--c-text-1); }
.search-clear svg { width: 14px; height: 14px; }

.search-count {
  font-size: 0.78rem;
  color: var(--c-text-3);
  margin: -16px 0 16px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 520px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

.card {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 14px;
  padding: 18px;
  text-decoration: none;
  color: var(--c-text-1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.card:not(.card--disabled):hover {
  border-color: var(--c-brand);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--c-brand) 12%, transparent);
  transform: translateY(-2px);
  text-decoration: none;
}
.card--disabled { cursor: default; opacity: 0.55; }

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon { font-size: 1.4rem; }
.card-num {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-brand);
  margin-right: auto;
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.badge--green {
  background: color-mix(in srgb, #10b981 15%, transparent);
  color: #059669;
  border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
}
.badge--amber {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  color: #d97706;
  border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
}
.badge--muted {
  background: var(--c-bg-elv);
  color: var(--c-text-3);
  border: 1px solid var(--c-divider);
}

.card-title {
  font-size: 0.97rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}
.card-desc {
  font-size: 0.8rem;
  color: var(--c-text-2);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}
.card-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-brand);
  margin-top: 4px;
}

/* Empty state */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 20px;
  color: var(--c-text-2);
  font-size: 0.9rem;
}
.clear-btn {
  margin-top: 12px;
  padding: 8px 18px;
  background: var(--c-brand);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Skeleton */
.card-skeleton {
  height: 140px;
  background: var(--c-bg-elv);
  border-radius: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
