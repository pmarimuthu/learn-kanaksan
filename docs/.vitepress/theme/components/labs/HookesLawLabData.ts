export interface Reading { weights: number; force: number; extension: number }

export const SPRING_K = 25
export const WEIGHT_STEP = 100
export const MAX_WEIGHTS = 6

export const STEPS = [
  { id: 'stand',  label: 'Place the retort stand firmly on the bench so it does not tip.',       instruction: 'A stable base is critical — any wobble will affect your readings.',    equipment: '🗜️ Stand'  },
  { id: 'spring', label: 'Hook the spring onto the top rod of the stand.',                       instruction: 'Ensure the top coil is fully seated on the hook before releasing.',   equipment: '🌀 Spring' },
  { id: 'ruler',  label: 'Clamp the ruler vertically alongside the spring.',                     instruction: 'Align the zero mark with the bottom of the spring\'s natural length.', equipment: '📏 Ruler'  },
  { id: 'ready',  label: 'Mark the natural length of the spring — your zero reference point.',   instruction: 'All extensions are measured from this position. You are ready!',       equipment: null        },
]

export function calcExtension(numWeights: number): number {
  const force = numWeights * WEIGHT_STEP * 9.8 / 1000
  return parseFloat((force / SPRING_K * 100).toFixed(1))
}

export function calcForce(numWeights: number): number {
  return parseFloat((numWeights * WEIGHT_STEP * 9.8 / 1000).toFixed(2))
}
