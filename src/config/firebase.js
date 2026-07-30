"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if ((0, app_1.getApps)().length === 0) {
    try {
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Strip outer quotes if present and replace escaped newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin Initialized');
    }
    catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
    }
}
// Export a proxy object to keep backward compatibility with `admin.auth()` calls
const admin = {
    auth: () => (0, auth_1.getAuth)()
};
exports.default = admin;
//# sourceMappingURL=firebase.js.map