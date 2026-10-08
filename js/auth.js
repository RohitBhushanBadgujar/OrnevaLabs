/**
 * ORNEVA LABS - Authentication & Session Management
 * Handles Student & Admin credentials, sessions, and route guards
 */

(function () {
  const { CONFIG, showToast } = window.OrnevaUtils;

  const Auth = {
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
      return !!(student && student.studentId && student.token);
    },

    logoutStudent() {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      showToast("You have been signed out successfully.", "info");
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
      return !!(admin && admin.token && admin.role);
    },

    logoutAdmin() {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      showToast("Admin session ended.", "info");
      window.location.href = "admin-login.html";
    },

    requireAdminAuth() {
      if (!this.isAdminLoggedIn()) {
        window.location.href = "admin-login.html";
        return false;
      }
      return true;
    },

    // UI Updates
    updateNavbarAuth() {
      const student = this.getStudent();
      const authLinks = document.querySelectorAll('.nav-auth-slot');

      authLinks.forEach(slot => {
        if (student) {
          slot.innerHTML = `
            <a href="dashboard.html" class="nav-link btn-ghost-sm">
              <span class="user-avatar-dot"></span>
              <span>${student.name.split(' ')[0]}</span>
            </a>
            <button class="btn-logout-nav" id="nav-logout-btn" title="Sign Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
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
