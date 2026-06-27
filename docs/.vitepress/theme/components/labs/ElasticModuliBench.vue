<script setup lang="ts">
import { computed } from 'vue'
import { WIRE_A, WIRE_L } from './ElasticModuliLabData'

const props = defineProps<{
  color: string; label: string; mounted: boolean; load: number; Y: number
}>()

const MAX_PX = 55
const extPx = computed(() => {
  if (!props.mounted || props.load === 0) return 0
  const strain = (props.load / WIRE_A) / props.Y
  return Math.min(strain * WIRE_L * 1e5, MAX_PX)
})
const wireH  = computed(() => 80 + extPx.value)
const weightH = computed(() => Math.max(14, 10 + props.load / 20))
</script>

<template>
  <svg viewBox="0 0 140 230" class="bench">
    <rect x="20" y="18" width="100" height="7" fill="#94a3b8" rx="2"/>
    <rect x="20" y="18" width="5" height="190" fill="#94a3b8" rx="2"/>
    <rect x="115" y="18" width="5" height="190" fill="#94a3b8" rx="2"/>
    <rect x="20" y="205" width="100" height="5" fill="#94a3b8" rx="2"/>

    <template v-if="mounted">
      <rect x="60" y="25" width="20" height="6" fill="#475569" rx="1"/>
      <rect x="67" y="31" width="6" :height="wireH - 31" :fill="color" rx="1"/>
      <rect x="55" :y="wireH" width="30" height="8" fill="#475569" rx="2"/>

      <template v-if="load > 0">
        <rect x="58" :y="wireH + 8" width="24" :height="weightH" fill="#ef4444" rx="3"/>
        <text x="70" :y="wireH + 8 + weightH/2 + 3" font-size="8" text-anchor="middle" fill="#fff" font-weight="600">{{ load }}N</text>
        <line x1="92" y1="31" x2="92" :y2="wireH" stroke="#16a34a" stroke-width="1.2" stroke-dasharray="3 2"/>
        <text x="98" :y="(31 + wireH)/2 + 3" font-size="8" fill="#16a34a">ΔL</text>
      </template>

      <text x="70" :y="wireH + 8 + weightH + 14" font-size="8" text-anchor="middle" :fill="color" font-weight="600">{{ label }}</text>
    </template>

    <text v-else x="70" y="115" font-size="9" text-anchor="middle" fill="#94a3b8">Mount specimen →</text>
  </svg>
</template>

<style scoped>
.bench { width: 100%; max-width: 140px; background: var(--vp-c-bg-soft); border-radius: 10px; border: 1px solid var(--vp-c-divider); }
</style>
