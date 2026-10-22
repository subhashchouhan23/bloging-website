import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Post {
  id: string;
  title: string;
}

export async function listPosts(): Promise<Post[]> {
  const snap = await getDocs(collection(db, 'posts'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}
