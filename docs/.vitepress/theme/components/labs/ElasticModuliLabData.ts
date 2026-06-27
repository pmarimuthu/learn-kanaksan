export interface Reading { load: number; stress: number; strain: number; extension: number }

export const WIRE_L = 1.0
export const WIRE_D = 0.002
export const WIRE_A = Math.PI * (WIRE_D / 2) ** 2

export const MATERIALS = [
  { id: 'steel',  label: 'Steel wire',   icon: '⚙️',  Y: 200e9, color: '#64748b', sport: 'Cycle spokes · Stadium cables'   },
  { id: 'carbon', label: 'Carbon fibre', icon: '🏏',  Y: 70e9,  color: '#334155', sport: 'Cricket bats · Bike frames'       },
  { id: 'nylon',  label: 'Nylon cord',   icon: '🎾',  Y: 3e9,   color: '#ca8a04', sport: 'Tennis strings · Fishing line'    },
  { id: 'rubber', label: 'Rubber cord',  icon: '🪂',  Y: 0.05e9,color: '#dc2626', sport: 'Bungee cords · Shock absorbers'  },
]

export const LOADS = [50, 100, 150, 200, 250]

export const STEPS = [
  { id: 'pick',  label: 'Select a material to test', instruction: 'Each material has a different Young\'s modulus — its stiffness fingerprint.' },
  { id: 'mount', label: 'Mount the specimen in the rig', instruction: 'Clamp both ends so the load acts purely along the wire\'s axis.' },
  { id: 'load',  label: 'Apply loads one at a time', instruction: 'Record each reading — together they give you the stress–strain graph.' },
]

export function calcReading(loadN: number, Y: number): Reading {
  const stress = loadN / WIRE_A
  const strain = stress / Y
  return {
    load: loadN,
    stress: parseFloat((stress / 1e6).toFixed(2)),
    strain: parseFloat((strain * 1e6).toFixed(3)),
    extension: parseFloat((strain * WIRE_L * 1000).toFixed(5)),
  }
}
