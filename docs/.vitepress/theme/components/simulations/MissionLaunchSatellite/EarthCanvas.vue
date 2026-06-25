<script setup lang="ts">

import { onMounted, onUnmounted, ref } from 'vue'
import type { RenderFrame } from './types'
import { EARTH_RADIUS_M, geostationaryRadius } from './PhysicsEngine'
import {
  createStarfield,
  drawBackground,
  drawCrashMark,
  drawEarth,
  drawLaunchPad,
  drawPath,
  drawSatellite,
  drawTargetRing,
  makeCamera,
  nextViewRadius,
  STATUS_COLOR
} from './OrbitRenderer'

const wrapRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let resizeObserver: ResizeObserver | null = null
let dpr = 1
let cssW = 0
let cssH = 0
let viewRadius = EARTH_RADIUS_M * 1.6
const stars = createStarfield(170)
const geoRadiusM = geostationaryRadius()

function resize() {
  const wrap = wrapRef.value
  const canvas = canvasRef.value
  if (!wrap || !canvas) return
  cssW = wrap.clientWidth
  cssH = wrap.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.round(cssW * dpr))
  canvas.height = Math.max(1, Math.round(cssH * dpr))
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
  resize()
  resizeObserver = new ResizeObserver(() => resize())
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function draw(frame: RenderFrame) {
  if (!ctx || cssW === 0 || cssH === 0) return

  const distance = Math.hypot(frame.position.x, frame.position.y)
  viewRadius = nextViewRadius(viewRadius, distance)
  const cam = makeCamera(cssW, cssH, viewRadius)

  drawBackground(ctx, cssW, cssH, stars, frame.timeMs)

  if (frame.showGeoRing) {
    drawTargetRing(ctx, cam, geoRadiusM, '#22d3ee', 'Geostationary target')
  }

  drawEarth(ctx, cam)
  drawLaunchPad(ctx, cam)

  if (!frame.launched && frame.preview.length > 1) {
    drawPath(ctx, cam, frame.preview, 'rgba(226,232,240,0.85)', { dashed: true, width: 1.5 })
  }

  if (frame.trail.length > 1) {
    drawPath(ctx, cam, frame.trail, STATUS_COLOR[frame.status], { fadeTail: true, width: 2.5 })
  }

  if (frame.crashPoint) {
    drawCrashMark(ctx, cam, frame.crashPoint)
  } else {
    drawSatellite(ctx, cam, frame.position, frame.velocity, frame.status)
  }
}

defineExpose({ draw })
</script>

<template>
  <div ref="wrapRef" class="ec-wrap" role="img" aria-label="Live view of Earth and the satellite's flight path">
    <canvas ref="canvasRef" class="ec-canvas" />
  </div>
</template>

<style scoped>
.ec-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  border-radius: 16px;
  overflow: hidden;
  background: #040714;
}

.ec-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>
