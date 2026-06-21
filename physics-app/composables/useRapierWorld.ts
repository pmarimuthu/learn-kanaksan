/**
 * useRapierWorld
 *
 * Lazily loads @dimforge/rapier3d-compat WASM exactly once per app session
 * (module-level singleton). Each composable call owns one Rapier World that
 * is freed automatically on component unmount.
 *
 * Usage (inside onMounted — client-only):
 *   const { ready, init, step, dispose } = useRapierWorld()
 *   const { world, RAPIER } = await init()
 *   // create bodies with world + RAPIER …
 *   // call step(dt) each animation frame
 */

// ── Module-level singleton ────────────────────────────────────────────────────
// WASM is loaded at most once, regardless of how many experiments are mounted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rapierPromise: Promise<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getLoadedRapier(): Promise<any> {
  if (!rapierPromise) {
    rapierPromise = import('@dimforge/rapier3d-compat').then(async (R) => {
      await R.init()
      return R
    })
  }
  return rapierPromise
}

// ── Composable ────────────────────────────────────────────────────────────────
export interface GravityVec { x: number; y: number; z: number }

export function useRapierWorld(gravity: GravityVec = { x: 0, y: -9.81, z: 0 }) {
  const ready = ref(false)

  // Per-instance handles — plain variables (not reactive, no Vue tracking needed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let _R: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let _world: any = null

  /**
   * init() — Loads Rapier (first call only in this session), creates a fresh World.
   * Calling init() again frees the old world and creates a new one — use for reset.
   */
  async function init() {
    if (_world) {
      _world.free()
      _world = null
    }
    _R = await getLoadedRapier()
    _world = new _R.World(gravity)
    ready.value = true
    // Return handles so the caller can build bodies immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { world: _world as any, RAPIER: _R as any }
  }

  /**
   * step(dt) — Advance the world by dt seconds.
   * dt is clamped to ≤ 1/30 s to avoid the "spiral of death" at low frame rates.
   */
  function step(dt = 1 / 60) {
    if (_world) {
      _world.timestep = Math.min(dt, 1 / 30)
      _world.step()
    }
  }

  /** dispose() — Free the Rapier world. Called automatically on component unmount. */
  function dispose() {
    if (_world) {
      _world.free()
      _world = null
    }
    ready.value = false
  }

  onUnmounted(dispose)

  return { ready, init, step, dispose }
}
