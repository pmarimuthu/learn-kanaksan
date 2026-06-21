/**
 * Minimal i18n composable — English only for current scope.
 * Loads en.json once per app lifecycle; exposes t(key) for dot-notation lookup.
 * Add more locales by importing additional JSON files and switching on locale.value.
 */
import en from '~/i18n/locales/en.json'

type Messages = typeof en

/** Flatten nested object into dot-notation keys */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flatten(val as Record<string, unknown>, fullKey))
    } else {
      acc[fullKey] = String(val)
    }
    return acc
  }, {} as Record<string, string>)
}

const messages = flatten(en as unknown as Record<string, unknown>)

/**
 * t('quiz.title')              → 'Quick Check'
 * t('lesson.ncertRef', { ch: 2, sec: '1.3' }) → 'NCERT Ch 2, §1.3'
 */
export function useAppI18n() {
  function t(key: string, params?: Record<string, string | number>): string {
    let msg = messages[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        msg = msg.replace(`{${k}}`, String(v))
      }
    }
    return msg
  }

  return { t }
}
