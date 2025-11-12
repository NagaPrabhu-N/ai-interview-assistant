// src/lib/interviewRepo.ts
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function stamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function makeInterviewId(name: string | null | undefined) {
  const base = slugifyName(name || 'unknown');
  return `${base}__${stamp()}`; // readable + unique
}

export async function saveInterviewDoc(payload: any) {
  const id = makeInterviewId(payload?.name);
  const ref = doc(db, 'interviews', id);
  await setDoc(
    ref,
    {
      ...payload,
      createdAt: serverTimestamp(),
      createdAtMS: Date.now(),
    },
    { merge: false }
  );
  return id;
}

export async function fetchAllInterviews() {
  const ref = collection(db, 'interviews');
  const q = query(ref, orderBy('createdAtMS', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    const createdAtMs =
      typeof data?.createdAt?.toMillis === 'function'
        ? data.createdAt.toMillis()
        : data?.createdAtMS ?? null; // fall back to stored ms
    // Exclude the raw Firestore Timestamp to keep payload serializable
    const { createdAt, ...rest } = data;
    return { id: d.id, ...rest, createdAtMS: createdAtMs };
  });
}

export async function deleteAllInterviews() {
  const col = collection(db, "interviews");
  const snap = await getDocs(col);
  const deletions = snap.docs.map((d) => deleteDoc(doc(db, "interviews", d.id)));
  await Promise.all(deletions);
}
