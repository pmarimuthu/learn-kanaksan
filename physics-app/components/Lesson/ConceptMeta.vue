<template>
  <div class="concept-meta">
    <h1 class="cm-title">{{ title }}</h1>
    <p v-if="subtitle" class="cm-subtitle">{{ subtitle }}</p>

    <div class="cm-badges">
      <span v-for="tag in examTags" :key="tag" class="exam-badge">{{ tag }}</span>
      <span v-if="ncertChapter" class="ncert-badge">
        📘 NCERT Ch. {{ ncertChapter }}
        <template v-if="ncertSection"> · § {{ ncertSection }}</template>
        <template v-if="ncertPage"> · p. {{ ncertPage }}</template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  examTags?: string[]
  ncertChapter?: number
  ncertSection?: string
  ncertPage?: string
}>()
</script>

<style scoped>
.concept-meta {
  margin-bottom: 28px;
}
.cm-title {
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 8px;
}
.cm-subtitle {
  font-size: 1rem;
  color: var(--c-text-2);
  line-height: 1.5;
  margin: 0 0 14px;
}
.cm-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.exam-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--c-brand) 10%, transparent);
  color: var(--c-brand);
  border: 1px solid color-mix(in srgb, var(--c-brand) 25%, transparent);
}
.ncert-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-3);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  padding: 3px 10px;
  border-radius: 20px;
}
</style>
