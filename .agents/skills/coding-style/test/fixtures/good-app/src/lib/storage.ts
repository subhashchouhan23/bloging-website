import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadPostImage(postId: string, file: File): Promise<string> {
  const target = ref(storage, 'posts/' + postId + '/' + file.name);
  await uploadBytes(target, file);
  return getDownloadURL(target);
}
