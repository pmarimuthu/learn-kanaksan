import {
  doc, setDoc, updateDoc,
  increment, serverTimestamp, addDoc, collection,
} from 'firebase/firestore'
import { db } from './config'
import { checkIsNew, recordFingerprint } from './uniqueness'

const PROJECTS = 'projects'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function step(name: string, fn: () => Promise<void>) {
  try { await fn() } catch (e) { console.warn(`[pulse:${name}]`, e) }
}

export async function recordVisit(
  projectId: string,
  pageKey: string,
  fingerprintId: string
): Promise<void> {
  const today = todayISO()
  let isNewToProject = false, isNewToPage = false

  await step('checkIsNew', async () => {
    const r = await checkIsNew(projectId, fingerprintId, pageKey)
    isNewToProject = r.isNewToProject
    isNewToPage    = r.isNewToPage
  })

  await step('fingerprint', () =>
    recordFingerprint(projectId, fingerprintId, pageKey, isNewToProject, isNewToPage))

  await step('stats', async () => {
    const statsRef = doc(db, PROJECTS, projectId, 'stats', 'global')
    const snap = await import('firebase/firestore').then(m => m.getDoc(statsRef))
    const prevDate = snap.exists() ? snap.data().todayDate : null
    await setDoc(statsRef, {
      total:      increment(1),
      unique:     increment(isNewToProject ? 1 : 0),
      todayCount: prevDate === today ? increment(1) : 1,
      todayDate:  today,
    }, { merge: true })
  })

  if (!pageKey) return

  await step('pages', () =>
    setDoc(doc(db, PROJECTS, projectId, 'pages', pageKey), {
      pageKey,
      total:  increment(1),
      unique: increment(isNewToPage ? 1 : 0),
    }, { merge: true })
  )
}

export async function saveRating(
  projectId: string, pageKey: string, fingerprintId: string, score: number
): Promise<void> {
  const id = `${fingerprintId}_${pageKey}`
  await setDoc(doc(db, PROJECTS, projectId, 'ratings', id), {
    pageKey, fingerprintId, score, ts: serverTimestamp(),
  })
}

export async function saveIssue(
  projectId: string, pageKey: string, fingerprintId: string,
  category: string, comment: string
): Promise<void> {
  await addDoc(collection(db, PROJECTS, projectId, 'issues'), {
    pageKey, fingerprintId, category, comment, ts: serverTimestamp(),
  })
}
