/**
 * ORNEVA LABS - Global App Controller
 * Loader lifecycle, Mobile Navigation, Micro-animations, FAQs
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Loader Lifecycle - Dismiss immediately when page is loaded
  const loader = document.getElementById('orneva-global-loader');
  const dismissLoader = () => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  };

  // Immediate event or safety timeout (max 2 seconds fallback so never stuck)
  if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 150);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 150));
    setTimeout(dismissLoader, 2000);
  }

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const siteNavbar = document.querySelector('.site-navbar');
  if (mobileToggle && siteNavbar) {
    mobileToggle.addEventListener('click', () => {
      siteNavbar.classList.toggle('mobile-menu-open');
    });

    // Close menu when clicking outside or on a link
    document.addEventListener('click', (e) => {
      if (!siteNavbar.contains(e.target)) {
        siteNavbar.classList.remove('mobile-menu-open');
      }
    });

    document.querySelectorAll('.site-navbar .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        siteNavbar.classList.remove('mobile-menu-open');
      });
    });
  }

  // 3. Highlight Current Navigation Item
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.toLowerCase();
    if (
      (currentPath.endsWith('/') && (cleanHref === 'index.html' || cleanHref === '/')) ||
      (currentPath.includes('index.html') && (cleanHref === 'index.html' || cleanHref === '/')) ||
      (currentPath.includes('courses.html') && cleanHref.includes('courses.html')) ||
      (currentPath.includes('about.html') && cleanHref.includes('about.html')) ||
      (currentPath.includes('dashboard.html') && cleanHref.includes('dashboard.html'))
    ) {
      link.classList.add('active');
    }
  });

  // 4. FAQ Accordion Logic
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const parentItem = button.closest('.faq-item');
      if (!parentItem) return;
      const isOpen = parentItem.classList.contains('open');

      // Close other items in the same FAQ list
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));

      if (!isOpen) {
        parentItem.classList.add('open');
      }
    });
  });

  // 5. Scroll Header Shadow
  const handleScroll = () => {
    if (!siteNavbar) return;
    if (window.scrollY > 20) {
      siteNavbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
      siteNavbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      siteNavbar.style.borderBottomColor = 'var(--border-color)';
      siteNavbar.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // 6. Dark / Light Theme Controller
  const storedTheme = localStorage.getItem('orneva_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);

  const navRight = document.querySelector('.nav-right-actions');
  if (navRight && !document.getElementById('orneva-theme-toggle')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'orneva-theme-toggle';
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-label', 'Toggle theme mode');

    const updateIcon = (theme) => {
      toggleBtn.innerHTML = theme === 'light'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      toggleBtn.setAttribute('title', theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme');
    };

    updateIcon(storedTheme);

    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', active);
      localStorage.setItem('orneva_theme', active);
      updateIcon(active);
    });

    const authSlot = navRight.querySelector('.nav-auth-slot');
    if (authSlot) {
      navRight.insertBefore(toggleBtn, authSlot);
    } else {
      navRight.appendChild(toggleBtn);
    }
  }
});
