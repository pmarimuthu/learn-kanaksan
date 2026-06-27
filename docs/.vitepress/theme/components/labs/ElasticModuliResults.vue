<script setup lang="ts">
import { computed } from 'vue'
import type { Reading } from './ElasticModuliLabData'

const p = defineProps<{ readings: Reading[]; Y: number }>()

const W = 200, H = 160, PL = 40, PR = 12, PT = 12, PB = 28
const iW = W - PL - PR, iH = H - PT - PB
const maxStress = computed(() => Math.max(...p.readings.map(r => r.stress), 1))
const maxStrain = computed(() => Math.max(...p.readings.map(r => r.strain), 1))

function gx(r: Reading) { return PL + (r.strain / maxStrain.value) * iW }
function gy(r: Reading) { return PT + iH - (r.stress / maxStress.value) * iH }

const yMPA = computed(() => (p.Y / 1e9).toFixed(0))
</script>

<template>
  <div class="res-wrap">
    <table class="obs-table">
      <thead>
        <tr><th>Load (N)</th><th>Stress (MPa)</th><th>Strain (×10⁻⁶)</th><th>ΔL (mm)</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in readings" :key="r.load">
          <td>{{ r.load }}</td><td>{{ r.stress }}</td><td>{{ r.strain }}</td><td>{{ r.extension }}</td>
        </tr>
      </tbody>
    </table>

    <div class="graph-col">
      <p class="graph-title">Stress–Strain Graph <span class="y-val">(slope → Y = {{ yMPA }} GPa)</span></p>
      <svg v-if="readings.length >= 2" :viewBox="`0 0 ${W} ${H}`" class="graph-svg">
        <line :x1="PL" :y1="PT" :x2="PL" :y2="PT+iH" class="axis"/>
        <line :x1="PL" :y1="PT+iH" :x2="PL+iW" :y2="PT+iH" class="axis"/>
        <text :x="PL+iW/2" :y="H-4" font-size="8" text-anchor="middle" class="ax-lbl">Strain (×10⁻⁶)</text>
        <text :x="10" :y="PT+iH/2" font-size="8" text-anchor="middle" class="ax-lbl" :transform="`rotate(-90,10,${PT+iH/2})`">Stress (MPa)</text>
        <polyline :points="readings.map(r=>`${gx(r)},${gy(r)}`).join(' ')" fill="none" class="line"/>
        <circle v-for="r in readings" :key="r.load" :cx="gx(r)" :cy="gy(r)" r="3.5" class="dot">
          <title>{{ r.stress }} MPa · {{ r.strain }}×10⁻⁶</title>
        </circle>
      </svg>
      <p v-else class="hint">Add ≥ 2 loads to plot</p>
    </div>
  </div>
</template>

<style scoped>
.res-wrap { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-start; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--vp-c-divider); }
.obs-table { border-collapse: collapse; font-size: 12px; flex: 1; min-width: 210px; }
.obs-table th, .obs-table td { border: 0.5px solid var(--vp-c-divider); padding: 5px 8px; text-align: center; }
.obs-table th { background: var(--vp-c-bg-soft); font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); }
.graph-col { flex: 1; min-width: 190px; }
.graph-title { font-size: 11px; font-weight: 500; color: var(--vp-c-text-2); margin-bottom: 4px; }
.y-val { font-weight: 700; color: var(--vp-c-brand-1, #3b82f6); }
.graph-svg { width: 100%; }
.axis { stroke: var(--vp-c-divider); stroke-width: 1; }
.ax-lbl { fill: var(--vp-c-text-3); }
.line { stroke: var(--vp-c-brand-1, #3b82f6); stroke-width: 2; }
.dot { fill: var(--vp-c-brand-1, #3b82f6); }
.hint { font-size: 12px; color: var(--vp-c-text-3); }
</style>
