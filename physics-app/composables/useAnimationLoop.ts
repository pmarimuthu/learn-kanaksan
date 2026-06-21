/**
 * useAnimationLoop
 *
 * Encapsulates requestAnimationFrame with play / pause / stop controls.
 * The callback receives delta time in seconds (capped at 50 ms to avoid large
 * physics jumps after tab switches or slow frames).
 * Cleans up automatically on component unmount.
 *
 * Usage:
 *   const { running, play, pause, stop } = useAnimationLoop((dt) => {
 *     world.step(dt)
 *     renderer.render(scene, camera)
 *   })
 */
export function useAnimationLoop(onTick: (dt: number) => void) {
  const running = ref(false)
  let rafId = 0
  let lastTs = 0

  function tick(ts: number) {
    if (!running.value) return
    // dt in seconds; cap at 50 ms to keep physics stable
    const dt = lastTs > 0 ? Math.min((ts - lastTs) * 0.001, 0.05) : 1 / 60
    lastTs = ts
    onTick(dt)
    rafId = requestAnimationFrame(tick)
  }

  /** Start or resume the loop. No-op if already running. */
  function play() {
    if (running.value) return
    running.value = true
    lastTs = 0
    rafId = requestAnimationFrame(tick)
  }

  /** Pause the loop without resetting internal state. */
  function pause() {
    if (!running.value) return
    running.value = false
    cancelAnimationFrame(rafId)
    lastTs = 0
  }

  /** Alias for pause — semantically "end the loop entirely". */
  function stop() {
    pause()
  }

  onUnmounted(stop)

  return { running, play, pause, stop }
}
