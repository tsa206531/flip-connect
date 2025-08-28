import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION = 'appConfig'
const DOC_ID = 'draw'

export async function getDrawToggle(): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTION, DOC_ID)
    const snap = await getDoc(ref)
    if (!snap.exists()) return true // default enabled
    const data = snap.data() as any
    return typeof data?.enabled === 'boolean' ? data.enabled : true
  } catch (e) {
    console.warn('getDrawToggle failed:', e)
    return true
  }
}

export async function setDrawToggle(enabled: boolean, updatedBy?: string) {
  const ref = doc(db, COLLECTION, DOC_ID)
  await setDoc(ref, {
    enabled,
    updatedAt: serverTimestamp(),
    ...(updatedBy ? { updatedBy } : {}),
  }, { merge: true })
}
