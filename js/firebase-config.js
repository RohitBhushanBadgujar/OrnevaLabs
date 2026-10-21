/**
 * ORNEVA LABS - Firebase Configuration
 * "The Origin of New Possibilities"
 *
 * To connect to your Firebase project:
 * 1. Open Firebase Console (https://console.firebase.google.com)
 * 2. Go to Project Settings -> General -> Your apps -> Web app
 * 3. Copy your firebaseConfig and replace the values below or set window.ORNEVA_FIREBASE_CONFIG
 */

(function () {
  // Check if configuration already set via window or localStorage
  let savedConfig = null;
  try {
    const raw = localStorage.getItem('orneva_firebase_config');
    if (raw) savedConfig = JSON.parse(raw);
  } catch (e) {}

  window.ORNEVA_FIREBASE_CONFIG = window.ORNEVA_FIREBASE_CONFIG || savedConfig || {
    apiKey: "AIzaSyCq3GQNNts1i8KbwGDu4DsrrulKCEThtj4",
    authDomain: "orneva-labs.firebaseapp.com",
    projectId: "orneva-labs",
    storageBucket: "orneva-labs.firebasestorage.app",
    messagingSenderId: "993550102400",
    appId: "1:993550102400:web:2123351976922d6ccc9b65",
    measurementId: "G-GR4RXQ13DB"
  };

  // Helper function to check if live Firebase credentials have been configured
  window.isFirebaseConfigured = function () {
    const cfg = window.ORNEVA_FIREBASE_CONFIG;
    return !!(
      cfg &&
      cfg.apiKey &&
      !cfg.apiKey.includes("DummyKey") &&
      cfg.projectId &&
      !cfg.projectId.includes("Dummy")
    );
  };

  window.OrnevaFirebaseConfig = {
    getConfig: () => window.ORNEVA_FIREBASE_CONFIG,
    isFirebaseConfigured: window.isFirebaseConfigured
  };
})();
