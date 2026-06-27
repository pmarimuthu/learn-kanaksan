<script setup lang="ts">
import { computed } from 'vue'
import type { Phase } from './StressStrainLabData'

const p = defineProps<{ phase: Phase | null; phaseIndex: number }>()

const wireH   = computed(() => Math.min(80 + (p.phase?.extMM ?? 0) * 1.2, 155))
const isNeck  = computed(() => p.phaseIndex >= 4)
const isBroke = computed(() => p.phaseIndex >= 5)
const neckY   = computed(() => 60 + wireH.value * 0.6)
</script>

<template>
  <svg viewBox="0 0 120 220" class="bench">
    <rect x="20" y="14" width="80" height="10" fill="#94a3b8" rx="2"/>
    <rect x="20" y="14" width="5"  height="190" fill="#94a3b8" rx="2"/>
    <rect x="95" y="14" width="5"  height="190" fill="#94a3b8" rx="2"/>

    <rect x="50" y="24" width="20" height="7" fill="#475569" rx="1"/>

    <template v-if="phase">
      <template v-if="!isBroke">
        <rect v-if="!isNeck" x="57" y="31" width="6" :height="wireH - 31" fill="#94a3b8" rx="1"/>
        <template v-else>
          <rect x="57" y="31" width="6" :height="(neckY - 31) * 0.6" fill="#94a3b8" rx="1"/>
          <rect x="59" :y="31 + (neckY-31)*0.6" width="2" :height="(neckY-31)*0.4 + (wireH-neckY)*0.4" fill="#94a3b8"/>
          <rect x="57" :y="wireH - (wireH-neckY)*0.6" width="6" :height="(wireH-neckY)*0.6" fill="#94a3b8" rx="1"/>
        </template>
      </template>
      <template v-else>
        <rect x="57" y="31" width="6" :height="(wireH-31)*0.55" fill="#94a3b8" rx="1"/>
        <rect x="57" :y="31+(wireH-31)*0.62" width="6" :height="(wireH-31)*0.38" fill="#94a3b8" rx="1"/>
        <text x="60" :y="31+(wireH-31)*0.595" font-size="9" text-anchor="middle" fill="#ef4444">✕</text>
      </template>

      <rect x="50" :y="wireH" width="20" height="7" fill="#475569" rx="1"/>
      <rect v-if="phase.load > 0" x="53" :y="wireH+7" width="14" :height="8 + phase.load/40" fill="#ef4444" rx="2"/>
      <text v-if="phase.load > 0" x="60" :y="wireH+13+phase.load/80" font-size="7" text-anchor="middle" fill="#fff">{{ phase.load }}N</text>

      <rect x="20" :y="wireH+4" width="3" height="2" fill="#22c55e"/>
      <text x="24" :y="wireH+6" font-size="7" fill="#22c55e">ΔL={{ phase.extMM }}mm</text>
    </template>

    <text v-else x="60" y="115" font-size="8" text-anchor="middle" fill="#94a3b8">Run Step 1 →</text>

    <rect v-if="phase?.zone" x="20" y="196" width="80" height="14" :fill="phase.color" rx="3" opacity="0.15"/>
    <text v-if="phase?.zone" x="60" y="206" font-size="8" text-anchor="middle" :fill="phase.color" font-weight="600">{{ phase.zone }}</text>
  </svg>
</template>

<style scoped>
.bench { width: 100%; max-width: 120px; background: var(--vp-c-bg-soft); border-radius: 10px; border: 1px solid var(--vp-c-divider); }
</style>
