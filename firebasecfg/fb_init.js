// Single source of truth for Firebase (Compat). Comment in EN only.

import "https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDkHvGy0gmFSq0b7s_eXS-Csrje7nK625E",
  authDomain: "pcagate.firebaseapp.com",
  projectId: "pcagate",
  appId: "1:495812654469:web:67ed791a5223ade84040ec",
  storageBucket: "pcagate.firebasestorage.app"
};
// -------------------------------------

/** Initialize app once (idempotent). */
function ensureApp() {
  try {
    return firebase.apps?.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
  } catch (e) {
    // If another init raced, reuse existing
    return firebase.app();
  }
}

const app = ensureApp();
const auth = firebase.auth();
const firestore = firebase.firestore();

// Expose minimal globals for legacy modules that expect window.firebase
window.__pcacs_firebase_app__ = app;
window.__pcacs_firebase_ready__ = true;

export { app, auth, firestore, firebase };
