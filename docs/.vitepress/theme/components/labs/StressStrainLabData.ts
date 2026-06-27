export interface Phase {
  id: string; step: string; load: number; extMM: number
  stress: number; strain: number; zone: string | null; color: string; note: string
}

export const OBJECTIVE = 'Progressively load a steel wire to fracture, record extension at each stage, and plot the complete stress–strain curve — identifying the proportional limit (P), elastic limit (E), yield point (Y), ultimate tensile strength (U), and fracture point (B).'

export const APPARATUS = [
  { item: 'Steel wire — L = 2 m, A = 1 mm²', purpose: 'Test specimen, clamped vertically in rig' },
  { item: 'Micrometer screw gauge', purpose: 'Accurately measure wire diameter (Step 1)' },
  { item: 'Metre scale', purpose: 'Measure natural length L₀ (Step 1)' },
  { item: 'Slotted masses — 100 g each', purpose: 'Apply incremental tensile load (Steps 2–6)' },
  { item: 'Vernier extensometer', purpose: 'Measure wire extension ΔL at each load (Steps 2–6)' },
]

export const PHASES: Phase[] = [
  { id: 'setup', step: 'Clamp wire vertically. Measure L₀ = 2 m, d = 1.13 mm. Zero extensometer.',
    load: 0,   extMM: 0,    stress: 0,   strain: 0,      zone: null,           color: '#64748b',
    note: 'Wire under no load. Natural length is your zero reference.' },
  { id: 'p1',   step: 'Add F = 100 N. Record extension on extensometer.',
    load: 100, extMM: 1.0,  stress: 100, strain: 0.0005, zone: 'Proportional', color: '#22c55e',
    note: "Linear elastic — Hooke's Law holds. Unload now and wire returns fully." },
  { id: 'p2',   step: 'Add F = 200 N. Record ΔL — observe it doubles.',
    load: 200, extMM: 2.0,  stress: 200, strain: 0.001,  zone: 'Elastic',      color: '#3b82f6',
    note: 'Extension doubled for doubled load. Slope = Young\'s modulus Y = 200 GPa.' },
  { id: 'y',    step: 'Add F = 250 N. Watch extensometer — large sudden jump.',
    load: 250, extMM: 20.0, stress: 250, strain: 0.010,  zone: 'Yield',        color: '#f59e0b',
    note: 'Yield point! Extension jumps 10× for only 25% more load. Permanent set begins.' },
  { id: 'u',    step: 'Add F = 300 N. Observe visible necking at one point on wire.',
    load: 300, extMM: 40.0, stress: 300, strain: 0.020,  zone: 'UTS',          color: '#f97316',
    note: 'Ultimate Tensile Strength. Cross-section thins at neck — cannot carry more load.' },
  { id: 'b',    step: 'Wire fractures at neck under F = 260 N.',
    load: 260, extMM: 60.0, stress: 260, strain: 0.030,  zone: 'Fracture',     color: '#ef4444',
    note: 'Fracture point. Stress drops below UTS because neck area is much smaller.' },
]
