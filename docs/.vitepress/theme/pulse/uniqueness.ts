import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

const PROJECTS = 'projects'

function lsKey(type: string, projectId: string, extra = '') {
  return `pulse_${type}_${projectId}${extra ? '_' + extra : ''}`
}

export async function checkIsNew(
  projectId: string,
  fingerprintId: string,
  pageKey: string
): Promise<{ isNewToProject: boolean; isNewToPage: boolean }> {
  const lsProj = lsKey('proj', projectId)
  const lsPage = lsKey('page', projectId, pageKey)

  let isNewToProject = !localStorage.getItem(lsProj)
  let isNewToPage    = !localStorage.getItem(lsPage)

  if (isNewToProject) {
    const snap = await getDoc(doc(db, PROJECTS, projectId, 'fingerprints', fingerprintId))
    if (snap.exists()) { isNewToProject = false; localStorage.setItem(lsProj, '1') }
  }

  if (isNewToPage) {
    const snap = await getDoc(doc(db, PROJECTS, projectId, 'fingerprints', fingerprintId, 'pages', pageKey))
    if (snap.exists()) { isNewToPage = false; localStorage.setItem(lsPage, '1') }
  }

  if (isNewToProject) localStorage.setItem(lsProj, '1')
  if (isNewToPage)    localStorage.setItem(lsPage, '1')

  return { isNewToProject, isNewToPage }
}

export async function recordFingerprint(
  projectId: string,
  fingerprintId: string,
  pageKey: string,
  isNewToProject: boolean,
  isNewToPage: boolean
): Promise<void> {
  const fpRef = doc(db, PROJECTS, projectId, 'fingerprints', fingerprintId)
  if (isNewToProject) {
    await setDoc(fpRef, { firstSeen: serverTimestamp(), lastSeen: serverTimestamp() })
  } else {
    await updateDoc(fpRef, { lastSeen: serverTimestamp() })
  }
  if (isNewToPage) {
    await setDoc(
      doc(db, PROJECTS, projectId, 'fingerprints', fingerprintId, 'pages', pageKey),
      { firstSeen: serverTimestamp(), lastSeen: serverTimestamp() }
    )
  }
}
