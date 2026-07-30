import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let isFirebaseInitialized = false;

function initFirebase() {
  if (getApps().length > 0) {
    isFirebaseInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.warn('Firebase environment variables missing or incomplete.');
    return;
  }

  try {
    const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin Initialized Successfully');
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

initFirebase();

const admin = {
  auth: () => {
    if (!isFirebaseInitialized && getApps().length === 0) {
      initFirebase();
    }
    return getAuth();
  }
};

export default admin;
