import { initializeApp } from 'firebase/app';

const app = initializeApp({ projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID });

export default app;
