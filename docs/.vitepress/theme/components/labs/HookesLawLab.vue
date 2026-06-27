<script setup lang="ts">
import { ref, computed } from 'vue'
import HookesLawBench from './HookesLawBench.vue'
import HookesLawResults from './HookesLawResults.vue'
import { STEPS, MAX_WEIGHTS, SPRING_K, calcForce, calcExtension } from './HookesLawLabData'
import type { Reading } from './HookesLawLabData'

const assembled = ref<string[]>([])
const weights   = ref(0)
const readings  = ref<Reading[]>([])
const done      = ref(false)

const stepIndex  = computed(() => STEPS.findIndex(s => !assembled.value.includes(s.id)))
const nextStep   = computed(() => stepIndex.value >= 0 ? STEPS[stepIndex.value] : null)
const isReady    = computed(() => assembled.value.includes('ready'))

function place(id: string) {
  if (assembled.value.includes(id)) return
  assembled.value = [...assembled.value, id]
  const s = STEPS.find(s => s.id === id)
  if (s && !s.equipment) assembled.value = [...assembled.value, 'ready']
}

function addWeight() {
  if (weights.value >= MAX_WEIGHTS) return
  weights.value++
  readings.value.push({ weights: weights.value, force: calcForce(weights.value), extension: calcExtension(weights.value) })
  if (weights.value === MAX_WEIGHTS) done.value = true
}

function removeWeight() {
  if (weights.value <= 0) return
  weights.value--
  readings.value = readings.value.filter(r => r.weights <= weights.value)
  done.value = false
}

function reset() { assembled.value = []; weights.value = 0; readings.value = []; done.value = false }
</script>

<template>
  <div class="lab">
    <div class="lab-top">
      <HookesLawBench :assembled="assembled" :weights="weights" :spring-k="SPRING_K"/>

      <div class="lab-panel">
        <ol class="steps-list">
          <li v-for="(s, i) in STEPS.filter(s => s.equipment)" :key="s.id"
            :class="{ done: assembled.includes(s.id), active: nextStep?.id === s.id }">
            <span class="step-num">{{ i + 1 }}</span>
            <div class="step-body">
              <span class="step-label">{{ s.label }}</span>
              <span class="step-tip" v-if="nextStep?.id === s.id || assembled.includes(s.id)">{{ s.instruction }}</span>
              <button v-if="nextStep?.id === s.id" class="place-btn" @click="place(s.id)">
                Place {{ s.equipment }}
              </button>
            </div>
          </li>
          <li :class="{ done: isReady, active: nextStep?.id === 'ready' }">
            <span class="step-num">4</span>
            <div class="step-body">
              <span class="step-label">{{ STEPS[3].label }}</span>
              <span class="step-tip" v-if="nextStep?.id === 'ready' || isReady">{{ STEPS[3].instruction }}</span>
              <button v-if="nextStep?.id === 'ready'" class="place-btn" @click="place('ready')">
                Mark & Begin
              </button>
            </div>
          </li>
        </ol>

        <div class="weight-section" v-if="isReady">
          <p class="section-title">Add weights one at a time and record each reading</p>
          <div class="wt-row">
            <button class="wt-btn add" :disabled="weights >= MAX_WEIGHTS" @click="addWeight">＋ Add 100 g</button>
            <button class="wt-btn rem" :disabled="weights <= 0" @click="removeWeight">－ Remove</button>
            <span class="wt-count">{{ weights }} / {{ MAX_WEIGHTS }}</span>
          </div>
        </div>

        <div class="conclusion" v-if="done">
          <p>✅ <strong>Hooke's Law verified!</strong> The F–x graph is a straight line through the origin, confirming <em>F = kx</em> with k = {{ SPRING_K }} N/m.</p>
          <button class="reset-btn" @click="reset">↺ Restart experiment</button>
        </div>
      </div>
    </div>

    <HookesLawResults v-if="readings.length" :readings="readings"/>
  </div>
</template>

<style scoped>
.lab { padding: 4px 0; }
.lab-top { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
.lab-panel { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 16px; }

.steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.steps-list li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); opacity: 0.55; transition: opacity 0.2s, border-color 0.2s; }
.steps-list li.active { opacity: 1; border-color: var(--vp-c-brand-1, #3b82f6); background: var(--vp-c-brand-soft, #eff6ff); }
.steps-list li.done { opacity: 1; border-color: var(--vp-c-green-1, #22c55e); background: var(--vp-c-green-soft, #f0fdf4); }

.step-num { width: 20px; height: 20px; border-radius: 50%; background: var(--vp-c-divider); color: var(--vp-c-text-2); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.steps-list li.active .step-num { background: var(--vp-c-brand-1, #3b82f6); color: #fff; }
.steps-list li.done .step-num { background: var(--vp-c-green-1, #22c55e); color: #fff; }
.steps-list li.done .step-num { font-size: 0; }
.steps-list li.done .step-num::before { content: '✓'; font-size: 12px; }

.step-body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.step-label { font-size: 12px; font-weight: 500; color: var(--vp-c-text-1); line-height: 1.4; }
.step-tip { font-size: 11px; color: var(--vp-c-text-2); font-style: italic; line-height: 1.4; }
.place-btn { align-self: flex-start; margin-top: 4px; padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: var(--vp-c-brand-1, #3b82f6); color: #fff; cursor: pointer; }
.place-btn:hover { opacity: 0.88; }

.section-title { font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 8px; }
.wt-row { display: flex; align-items: center; gap: 8px; }
.wt-btn { padding: 6px 14px; font-size: 13px; border-radius: 7px; cursor: pointer; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); transition: background 0.15s; }
.wt-btn.add:not(:disabled) { border-color: var(--vp-c-brand-1, #3b82f6); color: var(--vp-c-brand-1, #3b82f6); }
.wt-btn.rem:not(:disabled) { border-color: var(--vp-c-red-1, #ef4444); color: var(--vp-c-red-1, #ef4444); }
.wt-btn:disabled { opacity: 0.35; cursor: default; }
.wt-count { font-size: 12px; color: var(--vp-c-text-3); }

.conclusion { padding: 10px 14px; border-radius: 8px; background: var(--vp-c-green-soft, #f0fdf4); border: 1px solid var(--vp-c-green-1, #22c55e); font-size: 13px; color: var(--vp-c-text-1); line-height: 1.5; }
.reset-btn { margin-top: 8px; padding: 5px 14px; font-size: 12px; border-radius: 6px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer; }
</style>
