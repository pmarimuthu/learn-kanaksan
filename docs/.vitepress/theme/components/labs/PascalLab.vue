<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setup } from './PascalLabSetup'

const cvs    = ref<HTMLCanvasElement>()
const ratio  = ref(5)
const info   = ref({ p: 0, f1: 0, f2: 0 })
const ready  = ref(false)
let cleanup: (() => void) | null = null

onMounted(async () => {
  if (!(window as any).Matter) {
    await new Promise<void>(r => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js'
      s.onload = () => r()
      document.head.appendChild(s)
    })
  }
  ready.value = true
  await new Promise(r => setTimeout(r, 50))
  cleanup = setup(cvs.value!, () => ratio.value, (p, f1, f2) => {
    info.value = { p, f1, f2 }
  })
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div class="lab">
    <p class="tag">🏋️ Drag the <b class="r">red piston</b> down → fluid pressure pushes the <b class="b">blue piston</b> up and lifts the 🚗 car!</p>

    <div class="scene">
      <canvas v-show="ready" ref="cvs" width="480" height="280" class="cvs"/>
      <div v-if="!ready" class="loading">Loading physics engine…</div>

      <div v-if="ready" class="hud">
        <div class="chip">
          <span class="lbl">Pressure p</span>
          <span class="num">{{ info.p.toFixed(1) }} kPa</span>
        </div>
        <div class="chip">
          <span class="lbl">F₁ you apply</span>
          <span class="num">{{ info.f1.toFixed(0) }} N</span>
        </div>
        <div class="chip accent">
          <span class="lbl">F₂ lifts car</span>
          <span class="num">{{ info.f2.toFixed(0) }} N 🚀</span>
        </div>
      </div>
    </div>

    <div class="ctrl">
      <span>Area ratio A₂/A₁</span>
      <input type="range" min="2" max="15" v-model.number="ratio"/>
      <strong>{{ ratio }}×</strong>
      <span class="hint">↑ bigger ratio = same push, {{ ratio }}× more lift force</span>
    </div>

    <div class="law">
      <span>Pascal's Law: </span>
      <span class="eq">p = F₁ / A₁ = F₂ / A₂</span>
      <span> → F₂ = F₁ × (A₂/A₁) = F₁ × {{ ratio }}</span>
    </div>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 10px; }
.tag { font-size: 13px; color: var(--vp-c-text-2); line-height: 1.5; }
.r { color: #ef4444; } .b { color: #2563eb; }
.scene { position: relative; border-radius: 12px; overflow: hidden; }
.cvs { width: 100%; display: block; }
.loading { height: 280px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); border-radius: 12px; }
.hud { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; }
.chip { background: rgba(255,255,255,0.93); border-radius: 8px; padding: 5px 10px; display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
.chip.accent { background: #fef2f2; }
.lbl { font-size: 10px; color: #64748b; white-space: nowrap; }
.num { font-size: 14px; font-weight: 700; color: #1c1c1a; white-space: nowrap; }
.chip.accent .num { color: #dc2626; }
.ctrl { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--vp-c-text-2); flex-wrap: wrap; }
.ctrl input { width: 110px; }
.hint { color: var(--vp-c-text-3); font-style: italic; }
.law { font-size: 12px; color: var(--vp-c-text-3); padding: 8px 12px; background: var(--vp-c-bg-soft); border-radius: 8px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.eq { font-weight: 600; color: var(--vp-c-text-1); }
</style>
