<script setup lang="ts">
import { ref, computed } from 'vue'
import StressStrainBench from './StressStrainBench.vue'
import StressStrainGraph from './StressStrainGraph.vue'
import { OBJECTIVE, APPARATUS, PHASES } from './StressStrainLabData'
import type { Phase } from './StressStrainLabData'

const objOpen  = ref(true)
const apxOpen  = ref(false)
const stepIdx  = ref(-1)
const done     = ref<Phase[]>([])

const curPhase = computed(() => stepIdx.value >= 0 ? PHASES[stepIdx.value] : null)
const finished = computed(() => stepIdx.value === PHASES.length - 1)

function runStep() {
  if (finished.value) return
  stepIdx.value++
  done.value.push(PHASES[stepIdx.value])
}
function reset() { stepIdx.value = -1; done.value = [] }
</script>

<template>
  <div class="lab">
    <p class="tagline">🏗️ Cable Engineering Lab — stress-test a steel wire to destruction and map its stress–strain signature.</p>

    <section class="panel">
      <button class="panel-hdr" @click="objOpen = !objOpen"><span>🎯 Objective</span><span class="chevron">{{ objOpen ? '▲' : '▼' }}</span></button>
      <p v-if="objOpen" class="obj-text">{{ OBJECTIVE }}</p>
    </section>

    <div class="two-col">
      <section class="panel">
        <button class="panel-hdr" @click="apxOpen = !apxOpen"><span>🔬 Apparatus</span><span class="chevron">{{ apxOpen ? '▲' : '▼' }}</span></button>
        <ul v-if="apxOpen" class="apx-list">
          <li v-for="a in APPARATUS" :key="a.item"><span class="apx-item">{{ a.item }}</span><span class="apx-purpose">{{ a.purpose }}</span></li>
        </ul>
      </section>

      <section class="panel proc-panel">
        <p class="panel-hdr static">📋 Procedure</p>
        <ol class="proc-list">
          <li v-for="(ph, i) in PHASES" :key="ph.id" :class="{ done: i <= stepIdx, active: i === stepIdx + 1 || (stepIdx === -1 && i === 0) }">
            <span class="pnum">{{ i + 1 }}</span><span class="plabel">{{ ph.step }}</span>
          </li>
        </ol>
        <div class="ctrl-row">
          <button class="run-btn" :disabled="finished" @click="runStep">{{ stepIdx < 0 ? '▶ Start experiment' : finished ? '✅ Complete' : `▶ Step ${stepIdx + 2}` }}</button>
          <button class="reset-btn" v-if="stepIdx >= 0" @click="reset">↺</button>
        </div>
      </section>
    </div>

    <section class="panel">
      <p class="panel-hdr static">🧪 Experiment</p>
      <div class="exp-row">
        <StressStrainBench :phase="curPhase" :phase-index="stepIdx"/>
        <StressStrainGraph :done="done"/>
      </div>
      <div v-if="curPhase" class="result-note" :style="`border-color:${curPhase.color}`">
        <span class="rn-zone" v-if="curPhase.zone" :style="`background:${curPhase.color}`">{{ curPhase.zone }}</span>
        {{ curPhase.note }}
      </div>
    </section>

    <section class="panel" v-if="done.length">
      <p class="panel-hdr static">📊 Observations</p>
      <table class="obs"><thead><tr><th>Step</th><th>Load (N)</th><th>ΔL (mm)</th><th>Stress (MPa)</th><th>Strain</th><th>Zone</th></tr></thead>
        <tbody><tr v-for="ph in done" :key="ph.id" :style="`border-left:3px solid ${ph.color}`">
          <td>{{ ph.id }}</td><td>{{ ph.load }}</td><td>{{ ph.extMM }}</td><td>{{ ph.stress }}</td><td>{{ ph.strain }}</td>
          <td><span class="zone-chip" :style="`background:${ph.color}22;color:${ph.color}`">{{ ph.zone ?? '—' }}</span></td>
        </tr></tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
.tagline { font-size: 12px; color: var(--vp-c-text-2); font-style: italic; }
.panel { border: 1px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden; }
.panel-hdr { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); border: none; cursor: pointer; } .panel-hdr.static { cursor: default; } .chevron { font-size: 10px; color: var(--vp-c-text-3); } .obj-text { padding: 10px 12px; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6; }
.apx-list { list-style: none; padding: 8px 12px; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.apx-list li { display: flex; flex-direction: column; gap: 1px; } .apx-item { font-size: 12px; font-weight: 500; color: var(--vp-c-text-1); } .apx-purpose { font-size: 11px; color: var(--vp-c-text-3); }
.two-col { display: grid; grid-template-columns: 1fr 1.6fr; gap: 10px; }
@media (max-width: 520px) { .two-col { grid-template-columns: 1fr; } }
.proc-panel { display: flex; flex-direction: column; }
.proc-list { list-style: none; padding: 8px 12px; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.proc-list li { display: flex; gap: 8px; align-items: flex-start; font-size: 11px; color: var(--vp-c-text-3); line-height: 1.4; } .proc-list li.done { color: var(--vp-c-text-2); } .proc-list li.active { color: var(--vp-c-text-1); font-weight: 500; }
.pnum { font-size: 10px; font-weight: 700; min-width: 14px; color: var(--vp-c-text-3); } .proc-list li.done .pnum { color: var(--vp-c-green-1,#22c55e); } .proc-list li.active .pnum { color: var(--vp-c-brand-1,#3b82f6); }
.ctrl-row { display: flex; gap: 8px; padding: 8px 12px; margin-top: auto; }
.run-btn { flex: 1; padding: 7px; font-size: 12px; font-weight: 600; border: none; border-radius: 7px; background: var(--vp-c-brand-1,#3b82f6); color: #fff; cursor: pointer; } .run-btn:disabled { background: var(--vp-c-green-1,#22c55e); cursor: default; }
.reset-btn { padding: 7px 12px; font-size: 12px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer; }
.exp-row { display: flex; gap: 14px; align-items: flex-start; padding: 12px; flex-wrap: wrap; }
.result-note { margin: 0 12px 12px; padding: 8px 12px; border-left: 3px solid; border-radius: 0 6px 6px 0; font-size: 12px; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); display: flex; gap: 8px; align-items: flex-start; }
.rn-zone { font-size: 10px; font-weight: 700; color: #fff; padding: 2px 8px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }
.obs { border-collapse: collapse; width: 100%; font-size: 12px; } .obs th, .obs td { border: 0.5px solid var(--vp-c-divider); padding: 5px 8px; text-align: center; } .obs th { background: var(--vp-c-bg-soft); font-size: 11px; color: var(--vp-c-text-2); font-weight: 600; }
.zone-chip { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
</style>
