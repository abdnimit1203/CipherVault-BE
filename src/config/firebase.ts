import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        // Strip outer quotes if present and replace escaped newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n') as string,
      }),
    });
    console.log('Firebase Admin Initialized');
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

// Export a proxy object to keep backward compatibility with `admin.auth()` calls
const admin = {
  auth: () => getAuth()
};

export default admin;
