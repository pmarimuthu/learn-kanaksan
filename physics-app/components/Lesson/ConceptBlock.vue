<template>
  <div class="block" :class="`block--${block.type}`">
    <div class="block-head">
      <span class="block-icon" v-html="icon" />
      <span class="block-label">{{ label }}</span>
    </div>
    <div class="block-body">
      <p v-for="(para, i) in paragraphs" :key="i" class="block-para">{{ para }}</p>
      <div v-if="block.latex" class="block-latex">{{ block.latex }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConceptBlock } from '~/types/physics'

const props = defineProps<{ block: ConceptBlock }>()
const { t } = useAppI18n()

const ICONS: Record<string, string> = {
  idea: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg>`,
  formula: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10.5" x2="16" y2="10.5"/><line x1="8" y1="15" x2="12" y2="15"/></svg>`,
  real: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  try: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6.6L4.9 18.8A2 2 0 0 0 6.7 22h10.6a2 2 0 0 0 1.8-3.2L14 9.6V3"/><line x1="7.5" y1="15" x2="16.5" y2="15"/></svg>`,
  whatif: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12.01" y2="8"/><path d="M10 11a2 2 0 1 1 4 0c0 1-2 2-2 2"/></svg>`,
}

const icon = computed(() => ICONS[props.block.type] ?? ICONS.idea)
const label = computed(() => props.block.heading || t(`block.${props.block.type}`))

// Split body on \n for multi-paragraph
const paragraphs = computed(() =>
  props.block.body.split('\n').filter((p) => p.trim())
)
</script>

<style scoped>
.block {
  border-radius: 12px;
  border: 1px solid var(--c-divider);
  overflow: hidden;
}

/* Color per block type */
.block--idea    { --bc: #06b6d4; --bg: color-mix(in srgb, #06b6d4 8%, var(--c-bg)); }
.block--formula { --bc: #8b5cf6; --bg: color-mix(in srgb, #8b5cf6 8%, var(--c-bg)); }
.block--real    { --bc: #10b981; --bg: color-mix(in srgb, #10b981 8%, var(--c-bg)); }
.block--try     { --bc: #f59e0b; --bg: color-mix(in srgb, #f59e0b 8%, var(--c-bg)); }
.block--whatif  { --bc: #ec4899; --bg: color-mix(in srgb, #ec4899 8%, var(--c-bg)); }

.block-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg, var(--c-bg-soft));
  border-bottom: 1px solid var(--c-divider);
}
.block-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--bc, var(--c-brand));
  flex-shrink: 0;
}
.block-icon :deep(svg) {
  width: 18px;
  height: 18px;
}
.block-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--bc, var(--c-brand));
  letter-spacing: 0.01em;
}
.block-body {
  padding: 14px 16px;
  background: var(--c-bg);
}
.block-para {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--c-text-1);
  margin: 0 0 0.6em;
}
.block-para:last-child { margin-bottom: 0; }
.block-latex {
  margin-top: 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.82rem;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 6px;
  padding: 8px 12px;
  overflow-x: auto;
}
</style>
