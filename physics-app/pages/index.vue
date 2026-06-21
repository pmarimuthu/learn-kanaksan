<template>
  <div class="home">
    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <div class="badge">Class 11 · Karnataka PU · NCERT</div>
          <h1 class="hero-h1">
            Physics that<br />
            <span class="accent">makes sense</span>
          </h1>
          <p class="tagline">
            Concept first. Formula second.<br />
            One real example. Then you own it.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/chapters" class="btn-primary">Start Learning →</NuxtLink>
            <NuxtLink to="/chapters/ch02-units-measurement/dimensional-analysis" class="btn-ghost">Try a Lesson</NuxtLink>
          </div>
          <div class="exam-tags">
            <span v-for="tag in examTags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="hero-anim">
          <div class="anim-card">
            <ClientOnly>
              <PhysicsAnim />
              <template #fallback>
                <!-- SSR placeholder — matches anim-card sizing, no layout shift -->
                <svg viewBox="0 0 320 160" class="anim-fallback" aria-hidden="true">
                  <path d="M20,140 Q160,10 300,140" fill="none" stroke="var(--c-brand)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.3"/>
                  <circle cx="20" cy="140" r="7" fill="var(--c-brand)" opacity="0.4"/>
                </svg>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURES ── -->
    <section class="section">
      <div class="section-inner">
        <h2 class="section-title">Built differently</h2>
        <div class="features">
          <div v-for="f in features" :key="f.title" class="feat-card" :style="`--fc:${f.color}`">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3 class="feat-title">{{ f.title }}</h3>
            <p class="feat-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '~/types/physics'

useSeoMeta({
  title: 'Physics Companion — Class 11',
  description:
    'Free Class 11 Physics — concept first, formula second. Interactive animations, real examples, quick quizzes. Karnataka PU · JEE · KCET.',
  ogTitle: 'Physics Companion — Class 11',
  ogDescription: 'Concept first. Formula second. One real example. Then you own it.',
})

const { data: chapters } = await useAsyncData('chapters', () =>
  $fetch<Chapter[]>('/data/chapters.json')
)

const examTags = ['JEE Main', 'JEE Advanced', 'KCET / KEA', 'Karnataka PU Board']

const features = [
  {
    icon: '💡',
    color: '#f59e0b',
    title: 'Concept First',
    desc: 'Understand the "why" before touching a formula. Every topic starts with intuition.',
  },
  {
    icon: '🌍',
    color: '#10b981',
    title: 'Real Examples',
    desc: 'Physics from everyday life — lightning, fridges, bridges, rockets.',
  },
  {
    icon: '✅',
    color: '#06b6d4',
    title: 'Quick Quizzes',
    desc: 'Bite-sized questions after each concept. Instant feedback.',
  },
  {
    icon: '🎬',
    color: '#8b5cf6',
    title: 'Live Animations',
    desc: 'Watch, Explore (interactive), and Feel (3D) — three ways to see physics.',
  },
]
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* ── HERO ── */
.hero {
  padding: 60px 20px 40px;
  background: linear-gradient(
    160deg,
    var(--c-bg) 0%,
    color-mix(in srgb, var(--c-brand) 6%, var(--c-bg)) 100%
  );
}
.hero-inner {
  max-width: 1152px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}
.badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-brand);
  background: color-mix(in srgb, var(--c-brand) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-brand) 30%, transparent);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 18px;
}
.hero-h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
}
.accent {
  background: linear-gradient(90deg, var(--c-brand), #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.tagline {
  font-size: 1.05rem;
  color: var(--c-text-2);
  line-height: 1.6;
  margin: 0 0 28px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.btn-primary {
  background: var(--c-brand);
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  transition: opacity 0.15s, transform 0.15s;
  display: inline-block;
}
.btn-primary:hover {
  opacity: 0.88;
  transform: translateY(-1px);
  text-decoration: none;
}
.btn-ghost {
  border: 2px solid var(--c-divider);
  color: var(--c-text-2);
  padding: 11px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: border-color 0.15s, color 0.15s;
  display: inline-block;
}
.btn-ghost:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
  text-decoration: none;
}
.exam-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.exam-tags span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-3);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  padding: 3px 10px;
  border-radius: 20px;
}

/* ── ANIMATION CARD ── */
.hero-anim {
  display: flex;
  justify-content: center;
}
.anim-card {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/3;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.anim-fallback {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── SECTIONS ── */
.section {
  padding: 60px 20px;
}
.section-alt {
  background: var(--c-bg-soft);
}
.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}
.section-title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 36px;
  text-align: center;
}

/* ── FEATURES ── */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.feat-card {
  background: var(--c-bg);
  border: 1px solid var(--c-divider);
  border-top: 3px solid var(--fc, #06b6d4);
  border-radius: 12px;
  padding: 24px 20px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.feat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.feat-icon {
  font-size: 1.8rem;
  margin-bottom: 12px;
}
.feat-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.feat-desc {
  font-size: 0.85rem;
  color: var(--c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* ── CHAPTER GRID ── */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}
.ch-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c-bg);
  border: 1px solid var(--c-divider);
  border-radius: 10px;
  padding: 12px 14px;
  text-decoration: none;
  color: var(--c-text-1);
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  cursor: pointer;
}
.ch-card:not(.ch-card--disabled):hover {
  border-color: var(--c-brand);
  background: color-mix(in srgb, var(--c-brand) 5%, var(--c-bg));
  transform: translateX(2px);
  text-decoration: none;
}
.ch-card--disabled {
  cursor: default;
  opacity: 0.6;
}
.ch-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.ch-num {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--c-brand);
  min-width: 22px;
  flex-shrink: 0;
}
.ch-title {
  font-size: 0.88rem;
  font-weight: 500;
  flex: 1;
}
.ch-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--c-text-3);
  border: 1px solid var(--c-divider);
  padding: 1px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}
.ch-arr {
  font-size: 0.85rem;
  color: var(--c-text-3);
  transition: color 0.15s;
  flex-shrink: 0;
}
.ch-card:hover .ch-arr {
  color: var(--c-brand);
}

/* skeleton */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}
.ch-skeleton {
  height: 48px;
  background: var(--c-bg-elv);
  border-radius: 10px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .hero-anim {
    order: -1;
  }
  .anim-card {
    max-width: 100%;
    aspect-ratio: 16/9;
  }
}
@media (max-width: 480px) {
  .hero {
    padding: 32px 16px 28px;
  }
  .section {
    padding: 40px 16px;
  }
  .chapter-grid {
    grid-template-columns: 1fr;
  }
  .features {
    grid-template-columns: 1fr;
  }
  .btn-primary,
  .btn-ghost {
    width: 100%;
    text-align: center;
  }
}
</style>
