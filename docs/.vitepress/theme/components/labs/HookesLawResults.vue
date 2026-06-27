<script setup lang="ts">
import { computed } from 'vue'
import type { Reading } from './HookesLawLabData'

const props = defineProps<{ readings: Reading[] }>()

const maxExt   = computed(() => Math.max(...props.readings.map(r => r.extension), 1))
const maxForce = computed(() => Math.max(...props.readings.map(r => r.force), 1))

const W = 200, H = 160, PAD = { l: 36, r: 12, t: 12, b: 28 }
const iW = W - PAD.l - PAD.r
const iH = H - PAD.t - PAD.b

function gx(r: Reading) { return PAD.l + (r.extension / maxExt.value) * iW }
function gy(r: Reading) { return PAD.t + iH - (r.force / maxForce.value) * iH }

const ticks = computed(() => props.readings.map(r => ({
  x: gx(r).toFixed(1), y: gy(r).toFixed(1),
  lx: r.extension.toFixed(1), ly: r.force.toFixed(2),
})))
</script>

<template>
  <div class="results-wrap">
    <table class="obs-table">
      <thead>
        <tr><th>#</th><th>Weights</th><th>Force (N)</th><th>Extension (cm)</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in readings" :key="r.weights">
          <td>{{ r.weights }}</td>
          <td>{{ r.weights }} × 100 g</td>
          <td>{{ r.force }}</td>
          <td>{{ r.extension }}</td>
        </tr>
      </tbody>
    </table>

    <div class="graph-box">
      <p class="graph-title">F vs x — Hooke's Law</p>
      <svg v-if="readings.length >= 2" :viewBox="`0 0 ${W} ${H}`" class="graph-svg">
        <line :x1="PAD.l" :y1="PAD.t" :x2="PAD.l" :y2="PAD.t+iH" class="axis"/>
        <line :x1="PAD.l" :y1="PAD.t+iH" :x2="PAD.l+iW" :y2="PAD.t+iH" class="axis"/>
        <text :x="PAD.l+iW/2" :y="H-4" font-size="8" text-anchor="middle" class="ax-label">Extension (cm)</text>
        <text :x="10" :y="PAD.t+iH/2" font-size="8" text-anchor="middle" class="ax-label" :transform="`rotate(-90,10,${PAD.t+iH/2})`">Force (N)</text>
        <polyline :points="ticks.map(t=>`${t.x},${t.y}`).join(' ')" fill="none" class="trend-line"/>
        <g v-for="(t,i) in ticks" :key="i">
          <circle :cx="t.x" :cy="t.y" r="3.5" class="dot"/>
          <title>F={{ t.ly }}N, x={{ t.lx }}cm</title>
        </g>
      </svg>
      <p v-else class="graph-hint">Add ≥ 2 weights to plot the graph</p>
    </div>
  </div>
</template>

<style scoped>
.results-wrap { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--vp-c-divider); }
.obs-table { border-collapse: collapse; font-size: 12px; flex: 1; min-width: 200px; }
.obs-table th, .obs-table td { border: 0.5px solid var(--vp-c-divider); padding: 5px 10px; text-align: center; }
.obs-table th { background: var(--vp-c-bg-soft); font-weight: 600; color: var(--vp-c-text-2); font-size: 11px; }
.obs-table td { color: var(--vp-c-text-1); }
.graph-box { flex: 1; min-width: 180px; }
.graph-title { font-size: 11px; color: var(--vp-c-text-2); margin-bottom: 4px; font-weight: 500; }
.graph-svg { width: 100%; }
.axis { stroke: var(--vp-c-divider); stroke-width: 1; }
.ax-label { fill: var(--vp-c-text-3); }
.trend-line { stroke: var(--vp-c-brand-1, #3b82f6); stroke-width: 2; }
.dot { fill: var(--vp-c-brand-1, #3b82f6); }
.graph-hint { font-size: 12px; color: var(--vp-c-text-3); }
</style>
