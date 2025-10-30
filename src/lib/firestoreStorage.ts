// src/lib/firestoreStorage.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Creates a Storage-like object for redux-persist
export function createFirestoreStorage(deviceId: string) {
  const docRef = doc(db, 'reduxStates', deviceId);

  return {
    // key is provided by redux-persist but we store 1 blob/doc per device
    async getItem(_key: string): Promise<string | null> {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data();
      return typeof data?.state === 'string' ? data.state : JSON.stringify(data?.state ?? null);
    },
    async setItem(_key: string, value: string): Promise<void> {
      // Store as a string to avoid type ambiguity and reduce Firestore indexing costs
      await setDoc(docRef, { state: value, updatedAt: Date.now() }, { merge: true });
    },
    async removeItem(_key: string): Promise<void> {
      await deleteDoc(docRef);
    },
  };
}
