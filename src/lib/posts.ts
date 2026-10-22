import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  category: string;
}

export type NewPost = Omit<Post, 'id'>;

// ---- reads ----
export async function listPosts(): Promise<Post[]> {
  const snap = await getDocs(query(collection(db, 'posts'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}

// ---- writes ----
export async function createPost(input: NewPost): Promise<string> {
  const ref = await addDoc(collection(db, 'posts'), input);
  return ref.id;
}
