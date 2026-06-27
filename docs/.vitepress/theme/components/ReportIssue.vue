<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vitepress'
import { resolvePageKey } from '../pulse/pagekey'
import { submitIssue } from '../pulse'

const route = useRoute()

const CATEGORIES = [
  'Content error',
  'Diagram / image issue',
  'Animation not working',
  'Formula / equation error',
  'Broken link',
  'Typo / language',
  'Other',
]

const emit = defineEmits<{ close: [] }>()

const category = ref(CATEGORIES[0])
const comment  = ref('')
const sending  = ref(false)
const done     = ref(false)

const pageKey = resolvePageKey

async function submit() {
  if (sending.value || done.value) return
  sending.value = true
  await submitIssue(pageKey(route.path), category.value, comment.value.trim())
  sending.value = false
  done.value = true
  setTimeout(() => emit('close'), 1600)
}
</script>

<template>
  <div class="ri-backdrop" @click.self="emit('close')">
    <div class="ri-modal" role="dialog" aria-modal="true" aria-label="Report an issue">
      <div class="ri-header">
        <span class="ri-title">Report an issue</span>
        <button class="ri-close" aria-label="Close" @click="emit('close')">✕</button>
      </div>

      <template v-if="!done">
        <label class="ri-label">Category</label>
        <select class="ri-select" v-model="category">
          <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
        </select>

        <label class="ri-label">
          Details <span class="ri-opt">(optional)</span>
          <span class="ri-char-count" :class="{ warn: comment.length >= 100 }">{{ comment.length }}/124</span>
        </label>
        <textarea
          class="ri-textarea"
          v-model="comment"
          rows="3"
          placeholder="Describe the issue…"
          maxlength="124"
          @paste.prevent
        />

        <button class="ri-submit" :disabled="sending" @click="submit">
          {{ sending ? 'Sending…' : 'Submit' }}
        </button>
      </template>

      <p v-else class="ri-thanks">✓ Reported — thank you!</p>
    </div>
  </div>
</template>

<style scoped>
.ri-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ri-modal {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
}
.ri-header { display: flex; align-items: center; justify-content: space-between; }
.ri-title { font-size: 0.95rem; font-weight: 700; color: var(--vp-c-text-1); }
.ri-close {
  background: none; border: none; cursor: pointer;
  color: var(--vp-c-text-3); font-size: 0.9rem; padding: 2px 6px;
  border-radius: 6px; transition: background 0.12s;
}
.ri-close:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.ri-label { font-size: 0.75rem; font-weight: 600; color: var(--vp-c-text-3); margin: 4px 0 0; display: flex; align-items: center; gap: 4px; }
.ri-opt { font-weight: 400; }
.ri-char-count { margin-left: auto; font-weight: 400; color: var(--vp-c-text-3); }
.ri-char-count.warn { color: #e57c00; }
.ri-select, .ri-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.ri-select:focus, .ri-textarea:focus { border-color: var(--vp-c-brand-1); }
.ri-textarea { resize: vertical; min-height: 72px; }
.ri-submit {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: opacity 0.15s;
}
.ri-submit:disabled { opacity: 0.55; cursor: not-allowed; }
.ri-thanks { text-align: center; color: var(--vp-c-brand-1); font-weight: 700; font-size: 0.95rem; margin: 8px 0; }
</style>
