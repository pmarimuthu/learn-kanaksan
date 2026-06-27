<script setup lang="ts">
import { ref, computed } from 'vue'
import ElasticModuliBench from './ElasticModuliBench.vue'
import ElasticModuliResults from './ElasticModuliResults.vue'
import { MATERIALS, LOADS, STEPS, calcReading } from './ElasticModuliLabData'
import type { Reading } from './ElasticModuliLabData'

const matId    = ref('')
const mounted  = ref(false)
const loadIdx  = ref(-1)
const readings = ref<Reading[]>([])

const mat      = computed(() => MATERIALS.find(m => m.id === matId.value))
const stepId   = computed(() => !matId.value ? 'pick' : !mounted.value ? 'mount' : 'load')
const curLoad  = computed(() => loadIdx.value >= 0 ? LOADS[loadIdx.value] : 0)
const done     = computed(() => loadIdx.value === LOADS.length - 1)

function pick(id: string) { matId.value = id; mounted.value = false; loadIdx.value = -1; readings.value = [] }
function mount() { if (matId.value) mounted.value = true }
function addLoad() {
  if (!mat.value || loadIdx.value >= LOADS.length - 1) return
  loadIdx.value++
  readings.value.push(calcReading(LOADS[loadIdx.value], mat.value.Y))
}
function removeLoad() { if (loadIdx.value < 0) return; loadIdx.value--; readings.value = readings.value.slice(0, -1) }
function reset() { matId.value = ''; mounted.value = false; loadIdx.value = -1; readings.value = [] }
</script>

<template>
  <div class="lab">
    <p class="lab-tagline">🏋️ Sports Materials Engineer — pick a material, stress-test it, read Young's modulus from the slope.</p>

    <div class="mat-grid">
      <button v-for="m in MATERIALS" :key="m.id" class="mat-card"
        :class="{ active: matId === m.id }" :style="matId === m.id ? `border-color:${m.color}` : ''"
        @click="pick(m.id)">
        <span class="mat-icon">{{ m.icon }}</span>
        <span class="mat-name">{{ m.label }}</span>
        <span class="mat-sport">{{ m.sport }}</span>
        <span class="mat-y" :style="`color:${m.color}`">Y = {{ (m.Y/1e9).toFixed(m.Y<1e9?2:0) }} GPa</span>
      </button>
    </div>

    <div class="lab-body">
      <ElasticModuliBench
        :color="mat?.color ?? '#94a3b8'" :label="mat?.label ?? ''"
        :mounted="mounted" :load="curLoad" :Y="mat?.Y ?? 1"/>

      <div class="lab-panel">
        <ol class="steps-list">
          <li v-for="(s, i) in STEPS" :key="s.id"
            :class="{ done: i < STEPS.findIndex(x=>x.id===stepId) || (stepId==='load' && done && i===2), active: s.id===stepId }">
            <span class="snum">{{ i+1 }}</span>
            <div class="sbody">
              <span class="slabel">{{ s.label }}</span>
              <span class="stip" v-if="s.id===stepId">{{ s.instruction }}</span>
              <button v-if="s.id==='mount' && stepId==='mount'" class="act-btn" @click="mount">Clamp specimen</button>
            </div>
          </li>
        </ol>

        <div class="load-ctrl" v-if="mounted">
          <button class="wt-btn add" :disabled="done" @click="addLoad">＋ Apply {{ LOADS[loadIdx+1] ?? '—' }} N</button>
          <button class="wt-btn rem" :disabled="loadIdx < 0" @click="removeLoad">－ Remove</button>
          <span class="lcount">{{ loadIdx+1 }} / {{ LOADS.length }}</span>
        </div>

        <div class="conclusion" v-if="done">
          <p>✅ <strong>Y = {{ mat ? (mat.Y/1e9).toFixed(mat.Y<1e9?2:0) : '' }} GPa</strong> — stress–strain is linear, confirming elastic behaviour. Slope of graph = Young's modulus.</p>
          <button class="reset-btn" @click="reset">↺ Test another material</button>
        </div>
      </div>
    </div>

    <ElasticModuliResults v-if="readings.length" :readings="readings" :Y="mat?.Y ?? 1"/>
  </div>
</template>

<style scoped>
.lab { padding: 4px 0; }
.lab-tagline { font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 12px; font-style: italic; }
.mat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 16px; }
@media (max-width: 500px) { .mat-grid { grid-template-columns: repeat(2,1fr); } }
.mat-card { border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 8px; background: var(--vp-c-bg-soft); cursor: pointer; display: flex; flex-direction: column; gap: 3px; text-align: left; transition: border-color 0.15s; } .mat-card.active { background: var(--vp-c-bg); }
.mat-icon { font-size: 18px; } .mat-name { font-size: 12px; font-weight: 600; color: var(--vp-c-text-1); } .mat-sport { font-size: 10px; color: var(--vp-c-text-3); line-height: 1.3; } .mat-y { font-size: 11px; font-weight: 700; margin-top: 2px; }
.lab-body { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
.lab-panel { flex: 1; min-width: 210px; display: flex; flex-direction: column; gap: 14px; }
.steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.steps-list li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); opacity: 0.5; transition: opacity 0.2s; }
.steps-list li.active { opacity: 1; border-color: var(--vp-c-brand-1,#3b82f6); background: var(--vp-c-brand-soft,#eff6ff); }
.steps-list li.done { opacity: 1; border-color: var(--vp-c-green-1,#22c55e); background: var(--vp-c-green-soft,#f0fdf4); }
.snum { width: 20px; height: 20px; border-radius: 50%; background: var(--vp-c-divider); color: var(--vp-c-text-2); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.steps-list li.active .snum { background: var(--vp-c-brand-1,#3b82f6); color:#fff; }
.steps-list li.done .snum { background: var(--vp-c-green-1,#22c55e); color:#fff; font-size:0; }
.steps-list li.done .snum::before { content:'✓'; font-size:12px; }
.sbody { display: flex; flex-direction: column; gap: 3px; } .slabel { font-size: 12px; font-weight: 500; color: var(--vp-c-text-1); } .act-btn { align-self: flex-start; margin-top: 4px; padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: var(--vp-c-brand-1,#3b82f6); color:#fff; cursor:pointer; } .load-ctrl { display: flex; align-items: center; gap: 8px; }
.wt-btn { padding: 6px 14px; font-size: 13px; border-radius: 7px; cursor: pointer; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.wt-btn.add:not(:disabled) { border-color: var(--vp-c-brand-1,#3b82f6); color: var(--vp-c-brand-1,#3b82f6); } .wt-btn.rem:not(:disabled) { border-color: var(--vp-c-red-1,#ef4444); color: var(--vp-c-red-1,#ef4444); }
.wt-btn:disabled { opacity: 0.35; cursor: default; } .lcount { font-size: 12px; color: var(--vp-c-text-3); } .stip { font-size: 11px; color: var(--vp-c-text-2); font-style: italic; } .conclusion { padding: 10px 14px; border-radius: 8px; background: var(--vp-c-green-soft,#f0fdf4); border: 1px solid var(--vp-c-green-1,#22c55e); font-size: 13px; color: var(--vp-c-text-1); line-height: 1.5; } .reset-btn { margin-top: 8px; padding: 5px 14px; font-size: 12px; border-radius: 6px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer; }
</style>
