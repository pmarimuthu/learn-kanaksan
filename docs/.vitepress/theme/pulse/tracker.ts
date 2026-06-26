import {
  doc, getDoc, setDoc, updateDoc,
  increment, serverTimestamp, addDoc, collection,
} from 'firebase/firestore'
import { db } from './config'

const VISITORS = 'visitors'
const PROJECTS = 'projects'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function lsKey(type: string, projectId: string, extra = '') {
  return `pulse_${type}_${projectId}${extra ? '_' + extra : ''}`
}

export async function recordVisit(
  projectId: string,
  pageKey: string,
  fingerprintId: string
): Promise<void> {
  const today = todayISO()

  const isNewToProject = !localStorage.getItem(lsKey('proj', projectId))
  const isNewToPage    = !localStorage.getItem(lsKey('page', projectId, pageKey))
  if (isNewToProject) localStorage.setItem(lsKey('proj', projectId), '1')
  if (isNewToPage)    localStorage.setItem(lsKey('page', projectId, pageKey), '1')

  const statsRef  = doc(db, PROJECTS, projectId, 'stats', 'global')
  const statsSnap = await getDoc(statsRef)
  if (!statsSnap.exists()) {
    await setDoc(statsRef, { total: 1, unique: 1, todayCount: 1, todayDate: today })
  } else {
    const d = statsSnap.data()
    await updateDoc(statsRef, {
      total:      increment(1),
      unique:     isNewToProject ? increment(1) : increment(0),
      todayCount: d.todayDate === today ? increment(1) : 1,
      todayDate:  today,
    })
  }

  if (!pageKey) return

  const pageRef  = doc(db, PROJECTS, projectId, 'pages', pageKey)
  const pageSnap = await getDoc(pageRef)
  if (!pageSnap.exists()) {
    await setDoc(pageRef, { pageKey, total: 1, unique: isNewToPage ? 1 : 0 })
  } else {
    await updateDoc(pageRef, {
      total:  increment(1),
      unique: isNewToPage ? increment(1) : increment(0),
    })
  }

  try {
    await setDoc(
      doc(db, VISITORS, fingerprintId),
      { firstSeen: serverTimestamp(), lastSeen: serverTimestamp() },
      { merge: true }
    )
  } catch (_) {}
}

export async function saveRating(
  projectId: string,
  pageKey: string,
  fingerprintId: string,
  score: number
): Promise<void> {
  const id = `${fingerprintId}_${pageKey}`
  await setDoc(doc(db, PROJECTS, projectId, 'ratings', id), {
    pageKey, fingerprintId, score, ts: serverTimestamp(),
  })
}

export async function saveIssue(
  projectId: string,
  pageKey: string,
  fingerprintId: string,
  category: string,
  comment: string
): Promise<void> {
  await addDoc(collection(db, PROJECTS, projectId, 'issues'), {
    pageKey, fingerprintId, category, comment, ts: serverTimestamp(),
  })
}
