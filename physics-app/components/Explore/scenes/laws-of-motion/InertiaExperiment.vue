<template>
  <div class="exp-wrap">
    <!-- ── Header ── -->
    <div class="exp-header">
      <span class="exp-chip">⚗️ Interactive Experiment</span>
      <h3 class="exp-title">Inertia &amp; Newton's First Law</h3>
      <p class="exp-desc">
        A net force of zero means no change in motion — forever. Set the velocity,
        toggle friction, and watch the law prove itself.
      </p>
    </div>

    <!-- ── Body: canvas left, panel right ── -->
    <div class="exp-body">
      <!-- Three.js viewport -->
      <div class="canvas-wrap" ref="canvasRef">
        <div v-if="!sceneMounted" class="canvas-loading">
          <span class="spin" />
          <span>Loading physics engine…</span>
        </div>
        <Transition name="msg">
          <div v-if="statusMsg && sceneMounted" class="canvas-msg">{{ statusMsg }}</div>
        </Transition>
      </div>

      <!-- Controls + readings panel -->
      <aside class="side-panel">

        <!-- Controls -->
        <section class="panel-sec">
          <h4 class="sec-head">Controls</h4>

          <!-- Velocity slider -->
          <div class="ctrl-row">
            <label class="ctrl-label">Initial Velocity</label>
            <div class="slider-row">
              <input
                type="range" min="0" max="10" step="0.5"
                v-model.number="initialVelocity"
                :disabled="isPlaying"
                class="slider"
              />
              <span class="slider-val">{{ initialVelocity.toFixed(1) }} m/s</span>
            </div>
          </div>

          <!-- Friction toggle -->
          <div class="ctrl-row">
            <label class="ctrl-label">Surface Friction</label>
            <button
              class="friction-toggle"
              :class="{ 'friction-toggle--on': frictionOn }"
              @click="handleFrictionToggle"
              :disabled="!sceneMounted"
            >
              <span class="ft-dot" />
              <span>{{ frictionOn ? `ON  (μ = ${FRICTION_MU})` : 'OFF (μ = 0 — frictionless)' }}</span>
            </button>
          </div>

          <!-- Apply impulse -->
          <button class="action-btn" @click="applyImpulse" :disabled="!sceneMounted">
            ⚡ Apply Impulse
            <span class="action-hint">Δv = +5 m/s</span>
          </button>
        </section>

        <!-- Live readings -->
        <section class="panel-sec">
          <h4 class="sec-head">Live Readings</h4>
          <div class="readings">
            <div class="reading">
              <span class="r-label">Velocity</span>
              <span class="r-value" :style="{ color: velColor }">{{ fmtVel }}</span>
              <span class="r-unit">m/s</span>
            </div>
            <div class="reading">
              <span class="r-label">Acceleration</span>
              <span class="r-value">{{ fmtAcc }}</span>
              <span class="r-unit">m/s²</span>
            </div>
            <div class="reading">
              <span class="r-label">Net Force</span>
              <span class="r-value">{{ fmtForce }}</span>
              <span class="r-unit">N</span>
            </div>
            <div class="reading">
              <span class="r-label">Time</span>
              <span class="r-value">{{ fmtTime }}</span>
              <span class="r-unit">s</span>
            </div>
          </div>
        </section>

        <!-- Educational insight -->
        <div class="insight" :class="insightClass">
          <span class="insight-icon">{{ insightIcon }}</span>
          <p class="insight-text">{{ insightText }}</p>
        </div>

      </aside>
    </div>

    <!-- ── Play bar ── -->
    <div class="playbar">
      <button class="pb play" @click="doPlay"    :disabled="isPlaying || !sceneMounted">▶ Play</button>
      <button class="pb"      @click="doPause"   :disabled="!isPlaying">⏸ Pause</button>
      <button class="pb mute" @click="doReset"   :disabled="!sceneMounted">↺ Reset</button>
      <button class="pb mute" @click="doRestart" :disabled="!sceneMounted">⟳ Restart</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'

// ── Constants ─────────────────────────────────────────────────────────────────
const BLOCK_MASS   = 2          // kg  (displayed, set via setAdditionalMass)
const FRICTION_MU  = 0.5        // kinetic friction coefficient
const BLOCK_X0     = -6         // starting x in Rapier world units
const TRACK_HALF   = 10         // track extends -10 … +10
const IMPULSE_N_S  = 10         // N·s  →  Δv = 10/2 = 5 m/s

// ── Composables ───────────────────────────────────────────────────────────────
const { scene, camera, mount: mountScene, render, dispose: disposeScene } = useThreeScene()
const { init: initWorld, dispose: disposeWorld }                          = useRapierWorld()
const { running, play: startLoop, pause: stopLoop }                       = useAnimationLoop(tick)

// ── DOM ref ───────────────────────────────────────────────────────────────────
const canvasRef = ref<HTMLDivElement | null>(null)

// ── Reactive state ────────────────────────────────────────────────────────────
const initialVelocity = ref(5)    // slider value (m/s)
const frictionOn      = ref(false) // surface friction toggle
const velocity        = ref(0)    // live m/s
const acceleration    = ref(0)    // live m/s²
const simTime         = ref(0)    // elapsed s
const sceneMounted    = ref(false) // true once Three.js + Rapier are ready
const hasStarted      = ref(false) // true once Play has been pressed ≥ once
const statusMsg       = ref('')   // canvas overlay text

const isPlaying = computed(() => running.value)

// ── Non-reactive physics handles (plain variables — no Vue tracking needed) ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let world:     any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RAPIER:    any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let blockBody: any = null
let prevV = 0          // previous frame velocity for Δv/Δt acceleration calc

// ── Non-reactive Three.js handle ──────────────────────────────────────────────
let blockMesh: THREE.Mesh | null = null

// ── Animation tick ────────────────────────────────────────────────────────────
function tick(dt: number) {
  if (!world || !blockBody || !blockMesh) return

  world.timestep = Math.min(dt, 1 / 30)
  world.step()

  const pos = blockBody.translation()
  const vel = blockBody.linvel()

  // Sync mesh → physics body
  blockMesh.position.x = pos.x
  blockMesh.position.y = pos.y

  // Live readings
  const curV = vel.x
  velocity.value     = curV
  acceleration.value = dt > 0 ? (curV - prevV) / dt : 0
  simTime.value      += dt
  prevV = curV

  // ── Termination checks ──
  // Block reached right wall
  if (pos.x > TRACK_HALF - 0.4) {
    stopLoop()
    statusMsg.value = frictionOn.value
      ? '🏁 Block reached the end of the track.'
      : '💡 No friction → block keeps moving forever. Newton\'s First Law!'
  }
  // Block effectively stopped (only meaningful when friction is on)
  if (frictionOn.value && Math.abs(curV) < 0.03 && simTime.value > 0.4) {
    stopLoop()
    statusMsg.value = '⏹ Friction (external force) brought the block to rest.'
  }

  render()
}

// ── Three.js scene construction ───────────────────────────────────────────────
function buildScene() {
  scene.background = new THREE.Color(0x0d1b2a)

  // Lighting
  scene.add(new THREE.AmbientLight(0x6688aa, 0.75))
  const sun = new THREE.DirectionalLight(0xffffff, 1.1)
  sun.position.set(4, 10, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  scene.add(sun)

  // Track surface — dark slate, full track length
  const trackGeo = new THREE.BoxGeometry(TRACK_HALF * 2, 0.2, 2.4)
  const trackMat = new THREE.MeshLambertMaterial({ color: 0x1e3a5f })
  const trackMesh = new THREE.Mesh(trackGeo, trackMat)
  trackMesh.receiveShadow = true
  scene.add(trackMesh)

  // Centre guide line — brand blue, faint
  const lineGeo = new THREE.BoxGeometry(TRACK_HALF * 2, 0.01, 0.05)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.45 })
  const lineMesh = new THREE.Mesh(lineGeo, lineMat)
  lineMesh.position.y = 0.11
  scene.add(lineMesh)

  // Distance tick marks every 2 units
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x4a6a8a, transparent: true, opacity: 0.35 })
  for (let x = -TRACK_HALF + 2; x < TRACK_HALF; x += 2) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 1.4), tickMat)
    m.position.set(x, 0.11, 0)
    scene.add(m)
  }

  // Green start marker at block origin
  const startMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.55 })
  const startMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 2.4), startMat)
  startMesh.position.set(BLOCK_X0, 0.11, 0)
  scene.add(startMesh)

  // Red end wall (visual cue for track boundary)
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 })
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 2.4), wallMat)
  wallMesh.position.set(TRACK_HALF - 0.06, 0.7, 0)
  scene.add(wallMesh)

  // Block — brand blue, casts shadows
  const blockGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  const blockMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 })
  blockMesh = new THREE.Mesh(blockGeo, blockMat)
  blockMesh.castShadow = true
  blockMesh.position.set(BLOCK_X0, 0.5, 0)
  scene.add(blockMesh)
}

// ── Rapier world construction ─────────────────────────────────────────────────
async function buildPhysics() {
  // initWorld() frees any existing world and creates a fresh one
  const handles = await initWorld()
  world  = handles.world
  RAPIER = handles.RAPIER

  const mu = frictionOn.value ? FRICTION_MU : 0

  // Ground — fixed rigid body spanning the full track
  const groundRb = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(TRACK_HALF, 0.1, 1.2).setFriction(mu),
    groundRb
  )

  // Right wall — prevents block from exiting the scene completely
  const wallRb = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(TRACK_HALF, 0.7, 0)
  )
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.05, 1.4, 1.2).setFriction(0).setRestitution(0.05),
    wallRb
  )

  // Block — dynamic body, mass locked to BLOCK_MASS kg, no rotation (1-D experiment)
  const blockDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(BLOCK_X0, 0.5, 0)
    .setLinearDamping(0)
    .setAngularDamping(100)    // prevent tipping without locking rotation axis
    .setAdditionalMass(BLOCK_MASS)
  blockBody = world.createRigidBody(blockDesc)
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.4, 0.4, 0.4).setFriction(mu),
    blockBody
  )

  // Reset readings and block mesh position
  velocity.value     = 0
  acceleration.value = 0
  simTime.value      = 0
  prevV              = 0
  if (blockMesh) blockMesh.position.set(BLOCK_X0, 0.5, 0)
}

// ── Player controls ───────────────────────────────────────────────────────────
function doPlay() {
  if (!blockBody || isPlaying.value) return
  statusMsg.value = ''

  if (!hasStarted.value) {
    // First press: give block its initial velocity
    blockBody.setLinvel({ x: initialVelocity.value, y: 0, z: 0 }, true)
    hasStarted.value = true
  }
  prevV = velocity.value
  startLoop()
}

function doPause() {
  stopLoop()
}

async function doReset() {
  stopLoop()
  hasStarted.value  = false
  statusMsg.value   = ''
  await buildPhysics()         // frees old world, creates fresh one
  render()                     // show block back at start
}

async function doRestart() {
  await doReset()
  doPlay()
}

async function handleFrictionToggle() {
  const wasPlaying = isPlaying.value
  stopLoop()
  frictionOn.value = !frictionOn.value
  hasStarted.value  = false
  statusMsg.value   = ''
  await buildPhysics()
  render()
  if (wasPlaying) doPlay()
}

function applyImpulse() {
  if (!blockBody) return
  statusMsg.value = ''
  // Apply impulse: F·Δt = m·Δv  →  Δv = IMPULSE_N_S / BLOCK_MASS = 5 m/s
  blockBody.applyImpulse({ x: IMPULSE_N_S, y: 0, z: 0 }, true)
  hasStarted.value = true
  if (!isPlaying.value) startLoop()   // auto-play so student sees movement
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!canvasRef.value) return

  // 1. Mount Three.js canvas (camera at slight elevation, centred on track)
  mountScene(canvasRef.value, {
    fov: 45,
    camPos:    [1, 4.5, 15],
    camTarget: [1, 0.5, 0],
  })

  // 2. Build scene objects (meshes, lights)
  buildScene()

  // 3. Init Rapier + create bodies
  await buildPhysics()

  // 4. First render (shows block at rest before Play)
  render()
  sceneMounted.value = true
})

onUnmounted(() => {
  stopLoop()
  disposeScene()
  disposeWorld()
})

// ── Computed display values ────────────────────────────────────────────────────
const fmtVel   = computed(() => velocity.value.toFixed(2))
const fmtAcc   = computed(() => acceleration.value.toFixed(2))
const fmtForce = computed(() => (BLOCK_MASS * Math.abs(acceleration.value)).toFixed(2))
const fmtTime  = computed(() => simTime.value.toFixed(1))

const velColor = computed(() => {
  const v = Math.abs(velocity.value)
  if (v < 0.05)  return '#9ca3af'   // stopped  — grey
  if (v < 2)     return '#f59e0b'   // slow     — amber
  return '#3b82f6'                   // moving   — brand blue
})

// ── Educational insight panel ─────────────────────────────────────────────────
const insightText = computed(() => {
  if (!hasStarted.value)
    return 'Set the initial velocity and press ▶ Play to start the experiment.'
  if (isPlaying.value && !frictionOn.value)
    return "Zero friction → zero net force → velocity stays constant. This IS Newton’s First Law."
  if (isPlaying.value && frictionOn.value)
    return 'Friction is an external force opposing motion. F = ma shows it decelerates the block.'
  if (!isPlaying.value && frictionOn.value && Math.abs(velocity.value) < 0.05)
    return 'The block stopped because friction (an external force) acted on it. No force = no stop.'
  if (!isPlaying.value && !frictionOn.value && simTime.value > 0)
    return 'The block reached the wall still moving — on a frictionless surface it never stops.'
  return 'Press ▶ Play to resume.'
})

const insightClass = computed(() => {
  if (!hasStarted.value)             return 'insight--neutral'
  if (isPlaying.value && !frictionOn.value) return 'insight--blue'
  if (isPlaying.value && frictionOn.value)  return 'insight--amber'
  return 'insight--green'
})

const insightIcon = computed(() => {
  if (!hasStarted.value)             return '⚡'
  if (isPlaying.value && !frictionOn.value) return '🔵'
  if (isPlaying.value && frictionOn.value)  return '🔴'
  return '✅'
})
</script>

<style scoped>
/* ── Outer wrapper ─────────────────────────────────────────────────────────── */
.exp-wrap {
  margin: 32px 0;
  border: 1px solid var(--c-divider);
  border-radius: 16px;
  overflow: hidden;
  background: var(--c-bg-soft);
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.exp-header {
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--c-divider);
}
.exp-chip {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #7c3aed;
  background: color-mix(in srgb, #7c3aed 10%, transparent);
  border: 1px solid color-mix(in srgb, #7c3aed 28%, transparent);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.exp-title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 5px;
}
.exp-desc {
  font-size: 0.8rem;
  color: var(--c-text-2);
  line-height: 1.5;
  margin: 0;
}

/* ── Body: canvas + side panel ─────────────────────────────────────────────── */
.exp-body {
  display: grid;
  grid-template-columns: 1fr 260px;
  min-height: 280px;
}
@media (max-width: 680px) {
  .exp-body { grid-template-columns: 1fr; }
}

/* ── Three.js canvas ─────────────────────────────────────────────────────────  */
.canvas-wrap {
  position: relative;
  height: 280px;
  background: #0d1b2a;
  overflow: hidden;
}
/* Three.js appends a <canvas> — make it fill the container */
.canvas-wrap :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.canvas-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6b7280;
  font-size: 0.8rem;
}
.spin {
  width: 22px;
  height: 22px;
  border: 2px solid #1e3a5f;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: sp 0.75s linear infinite;
}
@keyframes sp { to { transform: rotate(360deg); } }

.canvas-msg {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.78);
  color: #f1f5f9;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: 20px;
  white-space: nowrap;
  max-width: 92%;
  text-align: center;
  pointer-events: none;
}
.msg-enter-active, .msg-leave-active { transition: opacity 0.3s; }
.msg-enter-from, .msg-leave-to { opacity: 0; }

/* ── Side panel ──────────────────────────────────────────────────────────────  */
.side-panel {
  border-left: 1px solid var(--c-divider);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
@media (max-width: 680px) {
  .side-panel { border-left: none; border-top: 1px solid var(--c-divider); }
}

.panel-sec {
  padding: 12px 14px;
  border-bottom: 1px solid var(--c-divider);
}
.sec-head {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  margin: 0 0 10px;
}

/* ── Controls ────────────────────────────────────────────────────────────────  */
.ctrl-row { margin-bottom: 11px; }
.ctrl-row:last-child { margin-bottom: 0; }
.ctrl-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-2);
  margin-bottom: 5px;
}

.slider-row { display: flex; align-items: center; gap: 8px; }
.slider { flex: 1; accent-color: var(--c-brand); cursor: pointer; }
.slider:disabled { opacity: 0.4; cursor: default; }
.slider-val {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--c-brand);
  min-width: 48px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Friction toggle */
.friction-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 5px 10px 5px 5px;
  background: var(--c-bg);
  border: 1px solid var(--c-divider);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-text-2);
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  text-align: left;
}
.friction-toggle:disabled { opacity: 0.4; cursor: default; }
.friction-toggle--on {
  border-color: #ef4444;
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 7%, var(--c-bg));
}
.ft-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--c-divider);
  transition: background 0.15s;
}
.friction-toggle--on .ft-dot { background: #ef4444; }

/* Apply impulse button */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  margin-top: 10px;
  padding: 7px 10px;
  background: color-mix(in srgb, var(--c-brand) 10%, var(--c-bg));
  border: 1px solid color-mix(in srgb, var(--c-brand) 35%, transparent);
  border-radius: 8px;
  color: var(--c-brand);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.action-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--c-brand) 18%, var(--c-bg));
}
.action-btn:disabled { opacity: 0.38; cursor: default; }
.action-hint {
  font-size: 0.65rem;
  opacity: 0.65;
  font-weight: 500;
}

/* ── Live readings 2×2 grid ──────────────────────────────────────────────────  */
.readings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}
.reading {
  background: var(--c-bg);
  border: 1px solid var(--c-divider);
  border-radius: 8px;
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.r-label {
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-text-3);
}
.r-value {
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--c-text-1);
  transition: color 0.2s;
}
.r-unit {
  font-size: 0.58rem;
  color: var(--c-text-3);
}

/* ── Insight box ─────────────────────────────────────────────────────────────  */
.insight {
  margin: 10px 14px;
  padding: 9px 11px;
  border-radius: 10px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.73rem;
  line-height: 1.45;
}
.insight--neutral {
  background: var(--c-bg-elv);
  border: 1px solid var(--c-divider);
  color: var(--c-text-2);
}
.insight--blue {
  background: color-mix(in srgb, #3b82f6 9%, transparent);
  border: 1px solid color-mix(in srgb, #3b82f6 28%, transparent);
  color: #3b82f6;
}
.insight--amber {
  background: color-mix(in srgb, #f59e0b 9%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 28%, transparent);
  color: #b45309;
}
.insight--green {
  background: color-mix(in srgb, #22c55e 9%, transparent);
  border: 1px solid color-mix(in srgb, #22c55e 28%, transparent);
  color: #15803d;
}
.insight-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
.insight-text { margin: 0; }

/* ── Play bar ─────────────────────────────────────────────────────────────────  */
.playbar {
  padding: 10px 14px;
  border-top: 1px solid var(--c-divider);
  background: var(--c-bg);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pb {
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid var(--c-divider);
  background: var(--c-bg-soft);
  color: var(--c-text-1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.pb:hover:not(:disabled) {
  border-color: var(--c-brand);
  background: color-mix(in srgb, var(--c-brand) 6%, var(--c-bg));
}
.pb:disabled { opacity: 0.32; cursor: default; }
.pb.play {
  background: var(--c-brand);
  border-color: var(--c-brand);
  color: #fff;
}
.pb.play:hover:not(:disabled) {
  background: color-mix(in srgb, var(--c-brand) 82%, #000);
}
.pb.mute { color: var(--c-text-2); }
</style>
