

export interface Vec2 {
  x: number
  y: number
}

export interface BodyState {
  
  r: Vec2
  
  v: Vec2
  
  t: number
}

export type FlightStatus =
  | 'preparing'
  | 'ascending'
  | 'orbit'
  | 'escape'
  | 'reentry'
  | 'crashed'

export const FLIGHT_STATUS_LABEL: Record<FlightStatus, string> = {
  preparing: 'Preparing Launch',
  ascending: 'Ascending',
  orbit: 'Orbit Achieved',
  escape: 'Escape Trajectory',
  reentry: 'Re-entry',
  crashed: 'Crashed'
}

export interface LaunchParams {
  
  angleDeg: number
  
  velocityKms: number
  
  fuelPercent: number
}

export type SimSpeed = 1 | 5 | 10

export type RunPhase = 'idle' | 'running' | 'paused' | 'ended'

export interface OrbitalElements {
  
  energy: number
  
  angularMomentum: number
  
  eccentricity: number
  
  semiLatusRectum: number
  
  periapsis: number
  
  apoapsis: number
  
  trueAnomaly: number
  
  argOfPeriapsis: number
  isBound: boolean
}

export interface Telemetry {
  altitudeKm: number
  speedKm: number
  status: FlightStatus
  simTimeSec: number
  periapsisAltKm: number
  apoapsisAltKm: number | null
}

export type MissionId = 'leo' | 'geo' | 'escape'

export interface MissionDef {
  id: MissionId
  title: string
  brief: string
  successCondition: string
  
  targetAltitudeKm: number | null
  targetToleranceKm: number
}

export interface MissionProgress {
  id: MissionId
  
  holdSeconds: number
  
  requiredHoldSeconds: number
  completed: boolean
}

export interface LearningMoment {
  key: FlightStatus
  title: string
  body: string
}

export interface RenderFrame {
  launched: boolean
  position: Vec2 // world metres, Earth-centred
  velocity: Vec2 // m/s
  status: FlightStatus
  trail: Vec2[] // flown path so far, world metres
  preview: Vec2[] // predicted path for current slider settings (pre-launch)
  crashPoint: Vec2 | null
  showGeoRing: boolean
  timeMs: number
}
