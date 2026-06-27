<script setup lang="ts">
import { computed } from 'vue'
import { PHASES } from './StressStrainLabData'
import type { Phase } from './StressStrainLabData'

const p = defineProps<{ done: Phase[] }>()

const W = 240, H = 170
const PL = 38, PR = 10, PT = 10, PB = 36
const iW = W - PL - PR, iH = H - PT - PB

const MAX_STR  = 0.032
const MAX_STR2 = 320

function gx(strain: number)  { return PL + (strain / MAX_STR)  * iW }
function gy(stress: number)  { return PT + iH - (stress / MAX_STR2) * iH }

const pts = computed(() => p.done.map(ph => ({ x: gx(ph.strain), y: gy(ph.stress), ph })))

const zoneLabels = [
  { strain: 0.0003, stress: 160, label: 'P', title: 'Proportional' },
  { strain: 0.0008, stress: 215, label: 'E', title: 'Elastic' },
  { strain: 0.005,  stress: 255, label: 'Y', title: 'Yield' },
  { strain: 0.018,  stress: 305, label: 'U', title: 'UTS' },
  { strain: 0.028,  stress: 265, label: 'B', title: 'Fracture' },
]

const xTicks = [0, 0.01, 0.02, 0.03]
const yTicks = [0, 100, 200, 300]
</script>

<template>
  <div class="graph-wrap">
    <p class="g-title">Stress–Strain Curve</p>
    <svg :viewBox="`0 0 ${W} ${H}`" class="graph">
      <line :x1="PL" :y1="PT" :x2="PL" :y2="PT+iH" class="axis"/>
      <line :x1="PL" :y1="PT+iH" :x2="PL+iW" :y2="PT+iH" class="axis"/>

      <g v-for="t in xTicks" :key="'x'+t">
        <line :x1="gx(t)" :y1="PT+iH" :x2="gx(t)" :y2="PT+iH+4" class="tick"/>
        <text :x="gx(t)" :y="PT+iH+13" font-size="7" text-anchor="middle" class="ax-lbl">{{ t }}</text>
      </g>
      <g v-for="t in yTicks" :key="'y'+t">
        <line :x1="PL-4" :y1="gy(t)" :x2="PL" :y2="gy(t)" class="tick"/>
        <text :x="PL-6" :y="gy(t)+3" font-size="7" text-anchor="end" class="ax-lbl">{{ t }}</text>
      </g>
      <text :x="PL+iW/2" :y="H-4" font-size="8" text-anchor="middle" class="ax-lbl">Strain (ε)</text>
      <text :x="10" :y="PT+iH/2" font-size="8" text-anchor="middle" class="ax-lbl" :transform="`rotate(-90,10,${PT+iH/2})`">Stress (MPa)</text>

      <g v-if="done.length < PHASES.length" v-for="z in zoneLabels" :key="z.label" opacity="0.25">
        <circle :cx="gx(z.strain)" :cy="gy(z.stress)" r="8" fill="none" stroke="#94a3b8" stroke-dasharray="2"/>
        <text :x="gx(z.strain)" :y="gy(z.stress)+3" font-size="7" text-anchor="middle" fill="#94a3b8">{{ z.label }}</text>
      </g>

      <polyline v-if="pts.length >= 2"
        :points="pts.map(p=>`${p.x},${p.y}`).join(' ')"
        fill="none" stroke="var(--vp-c-brand-1,#3b82f6)" stroke-width="2"/>

      <g v-for="(pt,i) in pts" :key="i">
        <circle :cx="pt.x" :cy="pt.y" r="4" :fill="pt.ph.color"/>
        <text v-if="pt.ph.zone" :x="pt.x+6" :y="pt.y-4" font-size="7" :fill="pt.ph.color">{{ pt.ph.zone?.[0] }}</text>
        <title>{{ pt.ph.zone }} — σ={{ pt.ph.stress }} MPa, ε={{ pt.ph.strain }}</title>
      </g>
    </svg>
    <p class="g-hint">{{ done.length === 0 ? 'Run steps to plot the curve' : done.length < PHASES.length ? `${done.length}/${PHASES.length} points plotted` : '✅ Complete stress–strain curve' }}</p>
  </div>
</template>

<style scoped>
.graph-wrap { flex: 1; min-width: 200px; }
.g-title { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 4px; }
.graph { width: 100%; }
.axis { stroke: var(--vp-c-divider); stroke-width: 1; }
.tick { stroke: var(--vp-c-divider); stroke-width: 1; }
.ax-lbl { fill: var(--vp-c-text-3); }
.g-hint { font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px; }
</style>
