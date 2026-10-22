import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

// ---- config ----
const env = readEnv('.env.local');
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf8'));

// ---- seed posts ----
async function main() {
  for (const post of posts) {
    const ref = await addDoc(collection(db, 'posts'), post);
    console.log('added', ref.id, '-', post.title);
  }
  console.log('seeded', posts.length, 'posts');
}

function readEnv(file) {
  const out = {};
  const text = readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0) out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

main().catch(e => { console.error('ERR', e.message); process.exit(1); });
