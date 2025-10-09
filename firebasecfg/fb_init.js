// File: firebasecfg/fb_init.js
// Firebase Compat initialization for direct browser usage (no bundler).
// Works on Live Server and GitHub Pages.
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-compat.js";

// Firebase compat attaches itself to globalThis (window)
const firebase = window.firebase;

// -----------------------------------------------------------------------------
// Configuration (use your actual config here or from window.FIREBASE_CONFIG)
// -----------------------------------------------------------------------------
const firebaseConfig = window.FIREBASE_CONFIG || {
    apiKey: "AIzaSyDkHvGy0gmFSq0b7s_eXS-Csrje7nK625E",
    authDomain: "pcagate.firebaseapp.com",
    projectId: "pcagate",
    storageBucket: "pcagate.firebasestorage.app",
    messagingSenderId: "495812654469",
    appId: "1:495812654469:web:67ed791a5223ade84040ec"
};

// -----------------------------------------------------------------------------
// Initialize Firebase
// -----------------------------------------------------------------------------
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// -----------------------------------------------------------------------------
// Create handles (Auth + Firestore)
// -----------------------------------------------------------------------------
const auth = firebase.auth();
const db = firebase.firestore();

// -----------------------------------------------------------------------------
// Export handles for other modules
// -----------------------------------------------------------------------------
export { firebase, auth, db };
