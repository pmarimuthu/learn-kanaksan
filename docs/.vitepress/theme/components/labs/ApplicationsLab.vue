<script setup lang="ts">
import { ref, computed } from 'vue'
import ApplicationsBench from './ApplicationsBench.vue'

const mode    = ref<'flat'|'edge'>('flat')
const coins   = ref(1)
const objOpen = ref(true)
const apxOpen = ref(false)

const I_flat = 25 * 3 ** 3 / 12
const I_edge = 3  * 25** 3 / 12
const ratio  = Math.round(I_edge / I_flat)

const sagPx = computed(() => {
  const I = mode.value === 'flat' ? I_flat : I_edge
  return Math.round((coins.value / I_flat) * 40 * (I_flat / I))
})

function sag(orient: 'flat'|'edge') {
  const I = orient === 'flat' ? I_flat : I_edge
  return ((coins.value * 0.005 * 9.8 * 0.3**3) / (48 * 200e9 * I * 1e-12) * 1000).toFixed(3)
}

const sagMM = computed(() => sag(mode.value))
</script>

<template>
  <div class="lab">
    <p class="tag">🪵 Ruler Sag Lab — same ruler, same load. Flat vs on-edge. Why the huge difference?</p>

    <section class="panel">
      <button class="phdr" @click="objOpen=!objOpen"><span>🎯 Objective</span><span class="ch">{{ objOpen?'▲':'▼' }}</span></button>
      <p v-if="objOpen" class="pbody">Discover how beam <strong>depth d</strong> controls sag. Turn a ruler on its edge — without changing anything else — and sag drops <strong>{{ ratio }}×</strong>. This is exactly why bridge girders are I-shaped.</p>
    </section>

    <section class="panel">
      <button class="phdr" @click="apxOpen=!apxOpen"><span>🔬 Apparatus</span><span class="ch">{{ apxOpen?'▲':'▼' }}</span></button>
      <ul v-if="apxOpen" class="apx">
        <li><b>30 cm ruler</b> (d = 3 mm thick, b = 25 mm wide) — the beam</li>
        <li><b>2 thick books</b> ~25 cm apart — supports at both ends</li>
        <li><b>3 coins (5₹)</b> each ≈ 5 g — load at centre</li>
        <li><b>Thread + small scale</b> — to measure sag at midpoint</li>
      </ul>
    </section>

    <div class="two-col">
      <section class="panel">
        <p class="phdr static">📋 Procedure</p>
        <ol class="proc">
          <li>Place books 25 cm apart. Lay ruler <strong>flat</strong> across them.</li>
          <li>Put coins at centre. Measure sag δ with thread/scale.</li>
          <li>Turn ruler <strong>on its edge</strong>. Same coins, same position.</li>
          <li>Measure sag again. It drops by <strong>{{ ratio }}×</strong> — because sag ∝ 1/d³!</li>
        </ol>
      </section>

      <section class="panel">
        <p class="phdr static">🧪 Experiment</p>
        <div class="bench-wrap">
          <ApplicationsBench :mode="mode" :coins="coins" :sag-px="sagPx" :sag-m-m="sagMM"/>
          <div class="controls">
            <div class="trow">
              <button :class="['tog', {active: mode==='flat'}]"  @click="mode='flat'">📏 Flat</button>
              <button :class="['tog', {active: mode==='edge'}]"  @click="mode='edge'">📐 On Edge</button>
            </div>
            <label class="clbl">Coins: <strong>{{ coins }}</strong></label>
            <input type="range" min="1" max="3" v-model.number="coins" class="sl"/>
          </div>
        </div>
      </section>
    </div>

    <section class="panel">
      <p class="phdr static">📊 Observation — Same load · Same ruler · Same span</p>
      <table class="obs">
        <thead><tr><th>Orientation</th><th>Depth d</th><th>d³</th><th>Sag ({{ coins }} coin{{ coins>1?'s':'' }})</th><th>vs On-Edge</th></tr></thead>
        <tbody>
          <tr class="rf"><td>📏 Flat</td><td>3 mm</td><td>27</td><td>{{ sag('flat') }} mm</td><td>{{ ratio }}× more sag ⚠️</td></tr>
          <tr class="re"><td>📐 On Edge</td><td>25 mm</td><td>15 625</td><td>{{ sag('edge') }} mm</td><td>1× (reference ✅)</td></tr>
        </tbody>
      </table>
      <p class="insight">💡 <strong>Why I-beams?</strong> Most bending stress is at the top and bottom surfaces. The I-shape keeps material where stress is highest, removes it from the low-stress centre — lighter and equally stiff. The {{ ratio }}× depth difference alone explains everything.</p>
    </section>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; } .tag { font-size: 12px; color: var(--vp-c-text-2); font-style: italic; }
.panel { border: 1px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden; }
.phdr { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); border: none; cursor: pointer; } .phdr.static { cursor: default; } .ch { font-size: 10px; color: var(--vp-c-text-3); }
.pbody { padding: 10px 12px; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.65; } .apx { padding: 8px 20px; margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--vp-c-text-2); }
.two-col { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; } @media (max-width: 540px) { .two-col { grid-template-columns: 1fr; } }
.proc { padding: 8px 20px; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: var(--vp-c-text-2); line-height: 1.5; } .bench-wrap { padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; }
.controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; } .trow { display: flex; gap: 6px; }
.tog { padding: 5px 12px; font-size: 12px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer; } .tog.active { background: var(--vp-c-brand-1,#3b82f6); color: #fff; border-color: var(--vp-c-brand-1,#3b82f6); } .clbl { font-size: 12px; color: var(--vp-c-text-2); } .sl { width: 80px; }
.obs { border-collapse: collapse; width: 100%; font-size: 12px; } .obs th, .obs td { border: 0.5px solid var(--vp-c-divider); padding: 6px 10px; text-align: center; } .obs th { background: var(--vp-c-bg-soft); font-size: 11px; color: var(--vp-c-text-2); font-weight: 600; } .rf td { background: #fef9c322; } .re td { background: #eff6ff44; }
.insight { padding: 10px 12px; font-size: 12px; color: var(--vp-c-text-2); line-height: 1.6; border-top: 1px solid var(--vp-c-divider); }
</style>
