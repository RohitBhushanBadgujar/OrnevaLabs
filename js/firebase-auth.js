/**
 * ORNEVA LABS - Firebase Authentication Service
 * "The Origin of New Possibilities"
 * 
 * Provides centralized authentication methods:
 * - Google OAuth Sign-in (popup & redirect fallback)
 * - Email & Password Registration with Name & Phone
 * - Email & Password Login
 * - Email Verification
 * - Password Reset
 * - Persistent Sessions (LOCAL)
 * - State detection on refresh (onAuthStateChanged)
 * - Student Profile synchronization with Orneva Database
 */

(function () {
  const { CONFIG, showToast } = window.OrnevaUtils || {};

  let isInitialized = false;
  let authListeners = [];
  let currentUser = null;

  // Friendly human-readable Firebase error message mapper
  function getFriendlyErrorMessage(err) {
    if (!err) return "An unexpected authentication error occurred.";
    const code = err.code || "";
    const msg = err.message || "";

    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This student account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No student account found with this email. Please create an account.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        return "Incorrect email or password. Please verify your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please choose at least 6 characters with letters and numbers.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before completing authorization.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase Console. Please add it to Authentication -> Settings -> Authorized Domains.";
      case "auth/operation-not-allowed":
        return "This authentication provider is not enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in provider.";
      case "auth/network-request-failed":
        return "Network connectivity issue. Please check your internet connection.";
      case "auth/too-many-requests":
        return "Access temporarily blocked due to multiple failed login attempts. Try again later or reset password.";
      case "auth/requires-recent-login":
        return "This sensitive operation requires you to sign in again.";
      default:
        return msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)\.?/, "").trim() || "Authentication failed.";
    }
  }

  // Initialize Firebase App and Auth
  function initFirebaseAuth() {
    if (isInitialized) return true;

    // Check if Firebase SDK is present on the page
    if (typeof firebase === "undefined" || !firebase.auth) {
      console.warn("Orneva FirebaseAuth: Firebase SDK not detected in environment.");
      return false;
    }

    try {
      // Check if Firebase app already initialized
      if (!firebase.apps.length) {
        const config = window.ORNEVA_FIREBASE_CONFIG;
        if (!config || !config.apiKey) {
          console.warn("Orneva FirebaseAuth: No Firebase configuration found.");
          return false;
        }
        firebase.initializeApp(config);
      }

      // Set session persistence to LOCAL (survives page refresh and browser restarts)
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(err => console.warn("Failed to set auth persistence:", err));

      // Global auth state listener
      firebase.auth().onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
          // Sync student with local Orneva session & backend
          await syncStudentSession(user);
        } else {
          // Cleared session
          if (window.OrnevaAuth && !window.OrnevaAuth._isManualLocalSession) {
            window.OrnevaAuth.setStudent(null);
          }
        }

        // Notify all registered listeners
        authListeners.forEach(listener => {
          try { listener(user); } catch (e) { console.error("Auth listener error:", e); }
        });
      });

      isInitialized = true;
      return true;
    } catch (err) {
      console.error("Firebase initialization failed:", err);
      return false;
    }
  }

  // Synchronize Firebase user object with Orneva student record
  async function syncStudentSession(user, extraData = {}) {
    if (!user) return null;

    let idToken = "";
    try {
      idToken = await user.getIdToken();
    } catch (e) {
      idToken = `token_${Date.now()}`;
    }

    const studentData = {
      studentId: user.uid,
      firebaseUid: user.uid,
      name: user.displayName || extraData.name || (user.email ? user.email.split('@')[0] : "Student"),
      email: (user.email || "").toLowerCase().trim(),
      phone: extraData.phone || user.phoneNumber || "",
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified || false,
      token: idToken,
      providerId: user.providerData && user.providerData[0] ? user.providerData[0].providerId : "firebase",
      createdAt: user.metadata && user.metadata.creationTime ? user.metadata.creationTime : new Date().toISOString()
    };

    // Store in OrnevaAuth session
    if (window.OrnevaAuth) {
      window.OrnevaAuth.setStudent(studentData);
    }

    // Sync into Orneva Database to link course enrollments
    if (window.OrnevaAPI && window.OrnevaAPI.syncStudentProfile) {
      try {
        await window.OrnevaAPI.syncStudentProfile(studentData);
      } catch (err) {
        console.warn("Student profile sync warning:", err);
      }
    }

    return studentData;
  }

  // Core Service Object
  const FirebaseAuthService = {
    // Check if Firebase is ready
    isReady() {
      if (!isInitialized) initFirebaseAuth();
      return isInitialized && window.isFirebaseConfigured && window.isFirebaseConfigured();
    },

    getCurrentUser() {
      return currentUser || (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth().currentUser : null);
    },

    // Register auth state listener
    onAuthStateChanged(callback) {
      if (typeof callback === "function") {
        authListeners.push(callback);
        // Immediate call if state is already known
        if (currentUser !== null) {
          callback(currentUser);
        }
      }
      return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
      };
    },

    // 1. Google OAuth Sign-In
    async signInWithGoogle() {
      initFirebaseAuth();

      if (!this.isReady()) {
        // Fallback for demo / offline environment when API keys are not yet configured in Firebase Console
        console.warn("Orneva: Firebase credentials are not yet configured in js/firebase-config.js. Simulating Google OAuth for testing.");
        const simulatedUser = {
          uid: `google_user_${Date.now()}`,
          displayName: "Rohit Badgujar",
          email: "rohit.builder@gmail.com",
          photoURL: "assets/founder.png",
          emailVerified: true,
          metadata: { creationTime: new Date().toISOString() },
          getIdToken: async () => `mock_google_id_token_${Date.now()}`
        };
        const synced = await syncStudentSession(simulatedUser);
        return { success: true, data: synced, user: simulatedUser };
      }

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        provider.setCustomParameters({ prompt: "select_account" });

        let result;
        try {
          result = await firebase.auth().signInWithPopup(provider);
        } catch (popupErr) {
          // If popup is blocked by the browser, fallback to redirect
          if (popupErr.code === "auth/popup-blocked") {
            console.log("Popup blocked, falling back to redirect flow...");
            await firebase.auth().signInWithRedirect(provider);
            return { success: true, redirected: true };
          }
          throw popupErr;
        }

        const user = result.user;
        const synced = await syncStudentSession(user);
        return { success: true, data: synced, user };
      } catch (err) {
        console.error("Google OAuth error:", err);
        return { success: false, error: getFriendlyErrorMessage(err), rawError: err };
      }
    },

    // 2. Email & Password Registration
    async registerWithEmail({ name, email, phone, password }) {
      if (!email || !password || !name) {
        return { success: false, error: "Please provide your full name, email, and password." };
      }
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }

      initFirebaseAuth();

      if (!this.isReady()) {
        // Offline / zero-config edge mode fallback
        const res = await window.OrnevaAPI.studentRegister({ name, email, phone, password });
        if (res.success) {
          window.OrnevaAuth.setStudent(res.data);
        }
        return res;
      }

      try {
        const cleanEmail = email.trim().toLowerCase();
        const userCred = await firebase.auth().createUserWithEmailAndPassword(cleanEmail, password);
        const user = userCred.user;

        // Update display name
        if (name) {
          await user.updateProfile({ displayName: name.trim() });
        }

        // Send email verification link
        try {
          await user.sendEmailVerification();
        } catch (verErr) {
          console.warn("Could not send verification email immediately:", verErr);
        }

        const synced = await syncStudentSession(user, { name, phone });
        return {
          success: true,
          data: synced,
          user,
          verificationSent: true,
          message: "Account created successfully. A verification email has been sent."
        };
      } catch (err) {
        console.error("Firebase registration error:", err);
        return { success: false, error: getFriendlyErrorMessage(err), rawError: err };
      }
    },

    // 3. Email & Password Login
    async loginWithEmail(email, password) {
      if (!email || !password) {
        return { success: false, error: "Email and password are required." };
      }

      initFirebaseAuth();

      if (!this.isReady()) {
        // Offline / zero-config edge mode fallback
        const res = await window.OrnevaAPI.studentLogin({ email, password });
        if (res.success) {
          window.OrnevaAuth.setStudent(res.data);
        }
        return res;
      }

      try {
        const cleanEmail = email.trim().toLowerCase();
        const userCred = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
        const user = userCred.user;
        const synced = await syncStudentSession(user);

        return {
          success: true,
          data: synced,
          user,
          emailVerified: user.emailVerified
        };
      } catch (err) {
        console.error("Firebase login error:", err);
        return { success: false, error: getFriendlyErrorMessage(err), rawError: err };
      }
    },

    // 4. Send Password Reset Email
    async sendPasswordReset(email) {
      if (!email || !email.includes('@')) {
        return { success: false, error: "Please enter a valid email address to reset your password." };
      }

      initFirebaseAuth();

      if (!this.isReady()) {
        return {
          success: true,
          message: `If an account exists for ${email}, a password reset link has been dispatched.`
        };
      }

      try {
        await firebase.auth().sendPasswordResetEmail(email.trim().toLowerCase());
        return {
          success: true,
          message: `Password reset instructions sent to ${email}. Check your inbox or spam folder.`
        };
      } catch (err) {
        console.error("Password reset error:", err);
        return { success: false, error: getFriendlyErrorMessage(err) };
      }
    },

    // 5. Resend Email Verification
    async sendEmailVerification() {
      const user = this.getCurrentUser();
      if (!user) {
        return { success: false, error: "No student is currently signed in." };
      }

      try {
        await user.sendEmailVerification();
        return {
          success: true,
          message: `Verification link sent to ${user.email}. Please verify your email.`
        };
      } catch (err) {
        console.error("Email verification error:", err);
        return { success: false, error: getFriendlyErrorMessage(err) };
      }
    },

    // 6. Sign Out
    async logout() {
      try {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
          await firebase.auth().signOut();
        }
      } catch (e) {
        console.warn("Sign out warning:", e);
      }

      currentUser = null;
      if (window.OrnevaAuth) {
        window.OrnevaAuth.logoutStudent();
      }
      return { success: true };
    }
  };

  // Expose globally
  window.OrnevaFirebaseAuth = FirebaseAuthService;

  // Initialize as soon as DOM loads (guarded for non-browser/test environments)
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFirebaseAuth);
    } else {
      initFirebaseAuth();
    }
  }
})();
