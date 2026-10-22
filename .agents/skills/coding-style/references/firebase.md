# Firebase conventions

Stack: Vite + React + TypeScript, Firestore for data, Cloud Storage for files,
Firebase Hosting for deployment. No Auth yet. No other backend, database, or
hosting service.

## Project layout

```
src/
  lib/
    firebase.ts    # initializeApp, db, storage
    posts.ts       # Firestore helpers for posts
    storage.ts     # Storage helpers
  App.tsx
  main.tsx
firebase.json
firestore.rules
storage.rules
.env.example
```

## Environment

- Config comes from Vite env vars, never from checked-in literals (S017)
- All variables are prefixed `VITE_`
- `.env.local` stays untracked; `.env.example` documents the keys

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Initialize once

`src/lib/firebase.ts` is the only module that calls `initializeApp` (S018):

```ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(config);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Firestore helpers

Components never import `firebase/firestore` (S020). Add typed helpers in
`src/lib/` and export functions, not raw SDK objects:

```ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Post {
  id: string;
  title: string;
  body: string;
}

export async function listPosts(): Promise<Post[]> {
  const snap = await getDocs(collection(db, 'posts'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}
```

- Convert `Timestamp` to `Date` at the boundary, not in components
- Keep query construction (`where`, `orderBy`, `limit`) in helpers
- Return plain data; never leak `DocumentSnapshot` or `Query`

## Storage helpers

- Paths: `posts/{postId}/{filename}`, `users/{uid}/{filename}`
- Sanitize file names; never use user input as a full path
- Upload in `src/lib/storage.ts`; components receive a URL

```ts
export async function uploadPostImage(postId: string, file: File): Promise<string> {
  const target = ref(storage, 'posts/' + postId + '/' + file.name);
  await uploadBytes(target, file);
  return getDownloadURL(target);
}
```

## Security rules

- `firestore.rules` and `storage.rules` live in the repo
- Default deny; allow only the reads/writes the app needs
- Validate field types and sizes in rules, not only in the client
- Never ship `firebase-admin` or a service account to the client (S019)

## Deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage
```

- Hosting serves `dist/`, SPA rewrites to `/index.html`
- Deploy rules with the app; rules are not deployed by `hosting` alone
- Use emulators for local work: `firebase emulators:start`

## Do not add

No Next.js, router, UI kit, state library, axios/fetch wrapper, react-query,
Supabase, Express, Prisma, or another database. The client talks to Firebase
directly through `src/lib` (S021).
