<script setup lang="ts">
import { computed } from 'vue'

const p = defineProps<{ mode: 'flat'|'edge'; coins: number; sagPx: number; sagMM: string }>()
const rulerH = computed(() => p.mode === 'flat' ? 5 : 28)
const rulerY = computed(() => 90 - rulerH.value)
const fill   = computed(() => p.mode === 'flat' ? '#fde68a' : '#bfdbfe')
</script>

<template>
  <svg viewBox="0 0 300 160" class="bench">
    <rect x="10"  y="68" width="30" height="62" fill="#a0522d" rx="3"/>
    <rect x="260" y="68" width="30" height="62" fill="#a0522d" rx="3"/>
    <text x="25"  y="140" font-size="9" text-anchor="middle" fill="#92400e">Book</text>
    <text x="275" y="140" font-size="9" text-anchor="middle" fill="#92400e">Book</text>

    <path :d="`M 40 ${rulerY} Q 150 ${rulerY + sagPx} 260 ${rulerY}`"
      :fill="fill" stroke="#92400e" stroke-width="1"/>
    <rect x="40" :y="rulerY" width="220" :height="rulerH" :fill="fill" rx="1"/>

    <g v-for="c in coins" :key="c">
      <ellipse :cx="150" :cy="rulerY + sagPx - 6 - (c-1)*9" rx="12" ry="5"
        fill="#d4af37" stroke="#b8960c" stroke-width="1"/>
      <text :x="150" :y="rulerY + sagPx - 2 - (c-1)*9" font-size="7" text-anchor="middle" fill="#78350f">5₹</text>
    </g>

    <line v-if="sagPx > 2" x1="150" :y1="rulerY" x2="150" :y2="rulerY + sagPx"
      stroke="#ef4444" stroke-width="1" stroke-dasharray="3 2"/>
    <text v-if="sagPx > 2" x="158" :y="rulerY + sagPx/2 + 4" font-size="8" fill="#ef4444">δ={{ sagMM }}mm</text>

    <text x="150" y="155" font-size="8" text-anchor="middle" class="lbl">
      {{ mode==='flat'?'FLAT — d = 3 mm':'ON EDGE — d = 25 mm' }} · δ = {{ sagMM }} mm
    </text>
  </svg>
</template>

<style scoped>
.bench { width: 100%; background: var(--vp-c-bg-soft); border-radius: 8px; }
.lbl { fill: var(--vp-c-text-3); }
</style>
