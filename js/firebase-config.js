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
    apiKey: "AIzaSyDummyKeyForOrnevaLabsDemoMode_ReplaceWithYourKey",
    authDomain: "orneva-labs.firebaseapp.com",
    projectId: "orneva-labs",
    storageBucket: "orneva-labs.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
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
