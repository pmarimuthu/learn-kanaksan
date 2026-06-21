/**
 * useThreeScene
 *
 * Sets up a Three.js WebGLRenderer, PerspectiveCamera, and Scene inside a
 * given container element. Handles canvas resize via ResizeObserver and disposes
 * all GPU resources on component unmount.
 *
 * The composable does NOT add lights or meshes — the caller builds the scene.
 *
 * Usage (inside onMounted):
 *   const { scene, camera, mount, render, dispose } = useThreeScene()
 *   mount(containerEl, { fov: 45, camPos: [0, 4, 12], camTarget: [0, 0, 0] })
 *   scene.add(new THREE.AmbientLight(0xffffff, 0.8))
 *   scene.add(myMesh)
 *   // in animation loop:
 *   render()
 */

import * as THREE from 'three'

export interface ThreeSceneConfig {
  /** Vertical field of view in degrees (default 55). */
  fov?: number
  near?: number
  far?: number
  /** Camera world position [x, y, z]. */
  camPos?: [number, number, number]
  /** Point the camera looks at [x, y, z]. */
  camTarget?: [number, number, number]
}

export function useThreeScene() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500)

  let renderer: THREE.WebGLRenderer | null = null
  let roCleanup: (() => void) | null = null

  /**
   * mount(el, cfg) — Attach the renderer canvas to `el` and configure the camera.
   * Call once inside onMounted.
   */
  function mount(el: HTMLElement, cfg: ThreeSceneConfig = {}) {
    const {
      fov = 55,
      near = 0.1,
      far = 500,
      camPos = [0, 4, 12] as [number, number, number],
      camTarget = [0, 0, 0] as [number, number, number],
    } = cfg

    const w = Math.max(el.clientWidth, 1)
    const h = Math.max(el.clientHeight, 1)

    // Camera
    camera.fov = fov
    camera.near = near
    camera.far = far
    camera.aspect = w / h
    camera.position.set(...camPos)
    camera.lookAt(...camTarget)
    camera.updateProjectionMatrix()

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    // Resize observer — keeps canvas crisp when the container changes size
    const ro = new ResizeObserver(() => {
      if (!el || !renderer) return
      const nw = Math.max(el.clientWidth, 1)
      const nh = Math.max(el.clientHeight, 1)
      renderer.setSize(nw, nh)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    })
    ro.observe(el)
    roCleanup = () => ro.disconnect()
  }

  /** render() — Draw one frame. Call at the end of each animation tick. */
  function render() {
    renderer?.render(scene, camera)
  }

  /**
   * dispose() — Free all GPU resources (geometries, materials, textures, renderer).
   * Called automatically on unmount; safe to call manually for early cleanup.
   */
  function dispose() {
    roCleanup?.()
    roCleanup = null

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m?.dispose())
      }
    })

    // Remove all children so the scene is GC-able
    while (scene.children.length > 0) scene.remove(scene.children[0])

    renderer?.dispose()
    renderer = null
  }

  onUnmounted(dispose)

  return { scene, camera, mount, render, dispose }
}
