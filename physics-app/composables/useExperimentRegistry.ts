/**
 * useExperimentRegistry
 *
 * Maps experiment names (the `experiment` field in lesson JSON) to lazily-loaded
 * Vue components. Only the chunk for the requested experiment is fetched — Three.js
 * and Rapier are NOT part of the main app bundle.
 *
 * To add a new experiment:
 *   1. Build the .vue file under components/Explore/scenes/<chapter>/
 *   2. Add one line to REGISTRY below.
 */

import { defineAsyncComponent } from 'vue'

// ── Registry ──────────────────────────────────────────────────────────────────
const REGISTRY: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  // Chapter 5 — Laws of Motion
  InertiaExperiment: defineAsyncComponent(
    () => import('~/components/Explore/scenes/laws-of-motion/InertiaExperiment.vue')
  ),

  // Remaining ch05 experiments — uncomment as each is built:
  // MomentumExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/MomentumExperiment.vue')
  // ),
  // ImpulseExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/ImpulseExperiment.vue')
  // ),
  // ThirdLawExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/ThirdLawExperiment.vue')
  // ),
  // ConservationMomentumExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/ConservationMomentumExperiment.vue')
  // ),
  // EquilibriumExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/EquilibriumExperiment.vue')
  // ),
  // FrictionExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/FrictionExperiment.vue')
  // ),
  // CircularMotionExperiment: defineAsyncComponent(
  //   () => import('~/components/Explore/scenes/laws-of-motion/CircularMotionExperiment.vue')
  // ),
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useExperimentRegistry() {
  /**
   * resolve(name) — Returns the async component for the given experiment name,
   * or null if it is not yet registered. The lesson page handles null gracefully
   * by not rendering the experiment section.
   */
  function resolve(name: string | undefined) {
    if (!name) return null
    return REGISTRY[name] ?? null
  }

  return { resolve }
}
