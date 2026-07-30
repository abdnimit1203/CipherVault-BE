"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let isFirebaseInitialized = false;
function initFirebase() {
    if ((0, app_1.getApps)().length > 0) {
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
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        isFirebaseInitialized = true;
        console.log('Firebase Admin Initialized Successfully');
    }
    catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
    }
}
initFirebase();
const admin = {
    auth: () => {
        if (!isFirebaseInitialized && (0, app_1.getApps)().length === 0) {
            initFirebase();
        }
        return (0, auth_1.getAuth)();
    }
};
exports.default = admin;
