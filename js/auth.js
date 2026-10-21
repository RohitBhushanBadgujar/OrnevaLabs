/**
 * ORNEVA LABS - Authentication & Session Management
 * Handles Student & Admin credentials, sessions, and route guards
 * Synchronized with Firebase Authentication & Role Enforcement
 */

(function () {
  const { CONFIG, showToast, escapeHtml } = window.OrnevaUtils || {
    CONFIG: {
      STORAGE_KEYS: {
        STUDENT_SESSION: "orneva_student_session",
        ADMIN_SESSION: "orneva_admin_session"
      }
    },
    showToast: (m) => console.log(m),
    escapeHtml: (s) => String(s || '')
  };

  const Auth = {
    _isManualLocalSession: false,

    // Student Session Management
    getStudent() {
      try {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.STUDENT_SESSION);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    setStudent(studentData) {
      if (!studentData) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      } else {
        localStorage.setItem(CONFIG.STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(studentData));
      }
      this.updateNavbarAuth();
    },

    isStudentLoggedIn() {
      const student = this.getStudent();
      return !!(student && (student.studentId || student.firebaseUid) && student.token);
    },

    async logoutStudent() {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      if (window.OrnevaFirebaseAuth && typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
        try {
          await firebase.auth().signOut();
        } catch (e) {}
      }
      if (typeof showToast === 'function') {
        showToast("You have been signed out successfully.", "info");
      }
      this.updateNavbarAuth();
      if (window.location.pathname.includes("dashboard.html")) {
        window.location.href = "login.html";
      }
    },

    requireStudentAuth(redirectPath = null) {
      if (!this.isStudentLoggedIn()) {
        const target = redirectPath || window.location.pathname + window.location.search;
        window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
        return false;
      }
      return true;
    },

    // Admin Session Management
    getAdmin() {
      try {
        const raw = sessionStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    setAdmin(adminData) {
      if (!adminData) {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      } else {
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminData));
      }
    },

    isAdminLoggedIn() {
      const admin = this.getAdmin();
      return !!(admin && admin.token && admin.token.startsWith('adm_tok_') && admin.role);
    },

    logoutAdmin() {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      if (typeof showToast === 'function') {
        showToast("Admin session ended.", "info");
      }
      window.location.href = "admin-login.html";
    },

    requireAdminAuth() {
      if (!this.isAdminLoggedIn()) {
        window.location.href = "admin-login.html";
        return false;
      }
      return true;
    },

    // UI Updates across Navbars
    updateNavbarAuth() {
      const student = this.getStudent();
      const authLinks = document.querySelectorAll('.nav-auth-slot');

      authLinks.forEach(slot => {
        if (student) {
          const firstName = student.name ? student.name.split(' ')[0] : 'Student';
          const avatarHtml = student.photoURL 
            ? `<img src="${escapeHtml(student.photoURL)}" alt="${escapeHtml(firstName)}" class="nav-avatar-img" />`
            : `<span class="nav-avatar-initial">${escapeHtml(firstName.charAt(0).toUpperCase())}</span>`;

          slot.innerHTML = `
            <div class="nav-user-badge">
              <a href="dashboard.html" class="nav-profile-link" title="Open Student Dashboard">
                ${avatarHtml}
                <span class="nav-user-name">${escapeHtml(firstName)}</span>
              </a>
              <button class="btn-logout-nav" id="nav-logout-btn" title="Sign Out" aria-label="Sign Out">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          `;

          const logoutBtn = slot.querySelector('#nav-logout-btn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
              e.preventDefault();
              Auth.logoutStudent();
            });
          }
        } else {
          slot.innerHTML = `
            <a href="login.html" class="btn-nav-login">Sign In</a>
          `;
        }
      });
    }
  };

  window.OrnevaAuth = Auth;

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavbarAuth();
  });
})();
