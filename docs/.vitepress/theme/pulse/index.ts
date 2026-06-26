import { getFingerprint } from './fingerprint'
import { recordVisit } from './tracker'

const PROJECT_ID = import.meta.env.VITE_PULSE_ANALYTICS_KEY as string
const ALLOWED_HOST = 'learn.kanaksan.com'

function shouldTrack(): boolean {
  if (typeof window === 'undefined') return false
  if (window.location.hostname !== ALLOWED_HOST) return false
  if (navigator.webdriver) return false
  return true
}

export async function trackVisit(pageKey: string): Promise<void> {
  if (!shouldTrack()) return
  try {
    const fingerprintId = await getFingerprint()
    await recordVisit(PROJECT_ID, pageKey, fingerprintId)
  } catch (err) {
    console.warn('[pulse]', err)
  }
}
