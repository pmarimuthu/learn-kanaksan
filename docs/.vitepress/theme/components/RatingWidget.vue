<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vitepress'
import { resolvePageKey } from '../pulse/pagekey'
import { submitRating } from '../pulse'

const route = useRoute()

const LEVELS = [
  { score: 1, emoji: '😵', label: 'Lost' },
  { score: 2, emoji: '🤔', label: 'Confused' },
  { score: 3, emoji: '🙂', label: 'Getting it' },
  { score: 4, emoji: '💡', label: 'Got it!' },
  { score: 5, emoji: '🚀', label: 'Mastered!' },
]

const emit = defineEmits<{ close: [] }>()

const selected = ref<number | null>(null)
const submitted = ref(false)

const pageKey = resolvePageKey

async function pick(score: number) {
  if (submitted.value) return
  selected.value = score
  await submitRating(pageKey(route.path), score)
  submitted.value = true
  setTimeout(() => emit('close'), 1400)
}
</script>

<template>
  <div class="rw-backdrop" @click.self="emit('close')">
    <div class="rw-wrap">
      <div class="rw-header">
        <p class="rw-label">{{ submitted ? 'Thanks for your feedback!' : 'How well did you get this?' }}</p>
        <button class="rw-close" aria-label="Close" @click="emit('close')">✕</button>
      </div>
      <div class="rw-row">
        <button
          v-for="l in LEVELS"
          :key="l.score"
          class="rw-btn"
          :class="{ selected: selected === l.score, faded: selected !== null && selected !== l.score }"
          :title="l.label"
          :disabled="submitted"
          @click="pick(l.score)"
        >
          <span class="rw-emoji">{{ l.emoji }}</span>
          <span class="rw-lvl">{{ l.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rw-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.rw-wrap {
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 380px;
}
.rw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.rw-close {
  background: none; border: none; cursor: pointer;
  color: var(--vp-c-text-3); font-size: 0.9rem; padding: 2px 6px;
  border-radius: 6px; transition: background 0.12s;
}
.rw-close:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.rw-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin: 0;
  text-align: center;
}
.rw-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.rw-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s, opacity 0.2s;
  min-width: 60px;
}
.rw-btn:hover:not(:disabled) { transform: translateY(-3px); border-color: var(--vp-c-brand-1); }
.rw-btn.selected {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg));
  transform: translateY(-3px) scale(1.08);
}
.rw-btn.faded { opacity: 0.35; }
.rw-btn:disabled { cursor: default; }
.rw-emoji { font-size: 1.6rem; line-height: 1; }
.rw-lvl { font-size: 0.65rem; font-weight: 600; color: var(--vp-c-text-3); white-space: nowrap; }
</style>
