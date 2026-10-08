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
});
