/**
 * ORNEVA LABS - Courses Catalog Controller
 * Dynamic loading, search, category/difficulty filtering, sorting, states
 */

document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, escapeHtml, formatCurrency, debounce } = window.OrnevaUtils;

  const coursesGrid = $('#courses-grid');
  const searchInput = $('#course-search');
  const categoryFilters = $$('.category-filter-btn');
  const difficultySelect = $('#difficulty-select');
  const sortSelect = $('#sort-select');
  const coursesCountEl = $('#courses-count');

  if (!coursesGrid) return; // Not on courses page

  let state = {
    search: '',
    category: 'All',
    difficulty: 'All',
    sort: 'default',
    isLoading: false
  };

  // Render Loading Skeleton
  function renderLoading() {
    state.isLoading = true;
    coursesGrid.innerHTML = Array(3).fill(0).map(() => `
      <div class="glass-card course-card" style="opacity: 0.6; pointer-events: none;">
        <div class="course-card-thumb-wrap" style="background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
          <div class="spinner-inline"></div>
        </div>
        <div class="course-card-body">
          <div style="height: 14px; width: 40%; background: rgba(255,255,255,0.08); border-radius: 4px; margin-bottom: 12px;"></div>
          <div style="height: 24px; width: 85%; background: rgba(255,255,255,0.08); border-radius: 6px; margin-bottom: 12px;"></div>
          <div style="height: 14px; width: 100%; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 6px;"></div>
          <div style="height: 14px; width: 70%; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 20px;"></div>
          <div style="height: 36px; width: 100%; background: rgba(255,255,255,0.05); border-radius: 8px; margin-top: auto;"></div>
        </div>
      </div>
    `).join('');
  }

  // Render Error State with Retry Button
  function renderError(errorMessage) {
    state.isLoading = false;
    coursesGrid.innerHTML = `
      <div class="state-box state-box-error glass-card" style="grid-column: 1 / -1;">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="state-title">Unable to Load Courses</h3>
        <p class="state-desc">${escapeHtml(errorMessage || "We encountered a temporary network issue fetching courses.")}</p>
        <button id="retry-courses-btn" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Retry Loading
        </button>
      </div>
    `;

    const retryBtn = $('#retry-courses-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadCourses);
    }
  }

  // Render Empty State
  function renderEmpty() {
    state.isLoading = false;
    if (coursesCountEl) coursesCountEl.textContent = '0 courses found';
    coursesGrid.innerHTML = `
      <div class="state-box state-box-empty glass-card" style="grid-column: 1 / -1;">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 class="state-title">No matching courses found</h3>
        <p class="state-desc">Try tweaking your search keywords or switching category filters.</p>
        <button id="reset-filters-btn" class="btn btn-secondary">Reset Filters</button>
      </div>
    `;

    const resetBtn = $('#reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.search = '';
        state.category = 'All';
        state.difficulty = 'All';
        categoryFilters.forEach(b => b.classList.toggle('active', b.dataset.category === 'All'));
        if (difficultySelect) difficultySelect.value = 'All';
        if (sortSelect) sortSelect.value = 'default';
        loadCourses();
      });
    }
  }

  // Render Course Card Item
  function renderCourseCard(course) {
    const badgeCategoryClass = {
      AI: 'badge-orange',
      Productivity: 'badge-blue',
      Design: 'badge-purple',
      Startup: 'badge-green'
    }[course.category] || 'badge-orange';

    const toolsHtml = (course.tools || []).slice(0, 3).map(tool => 
      `<span class="tool-tag">${escapeHtml(tool)}</span>`
    ).join('');

    return `
      <article class="glass-card course-card">
        <div class="course-card-thumb-wrap">
          <a href="course.html?slug=${encodeURIComponent(course.slug)}" aria-label="${escapeHtml(course.title)}">
            <img src="${escapeHtml(course.thumbnail || 'assets/courses/course-ai-app.jpg')}" alt="${escapeHtml(course.title)}" class="course-card-img" loading="lazy" />
          </a>
          <div class="course-card-badges">
            <span class="badge ${badgeCategoryClass}">${escapeHtml(course.category)}</span>
            <span class="badge" style="background: rgba(0,0,0,0.6); color: #e2e8f0; border-color: rgba(255,255,255,0.1);">${escapeHtml(course.difficulty)}</span>
          </div>
        </div>

        <div class="course-card-body">
          <div class="course-card-meta">
            <div class="meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${escapeHtml(course.duration)}</span>
            </div>
            <div class="meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>${(course.curriculum || []).length} Modules</span>
            </div>
          </div>

          <h3 class="course-card-title">
            <a href="course.html?slug=${encodeURIComponent(course.slug)}">${escapeHtml(course.title)}</a>
          </h3>

          <p class="course-card-desc">${escapeHtml(course.subtitle || course.description)}</p>

          <div class="course-card-tools">
            ${toolsHtml}
          </div>

          <div class="course-card-footer">
            <div class="course-card-price">${formatCurrency(course.price)}</div>
            <a href="course.html?slug=${encodeURIComponent(course.slug)}" class="btn btn-primary btn-card-action">
              View Course
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Load and Render Courses
  async function loadCourses() {
    renderLoading();
    try {
      const response = await window.OrnevaAPI.getCourses({
        search: state.search,
        category: state.category,
        difficulty: state.difficulty,
        sort: state.sort
      });

      if (!response || !response.success) {
        renderError(response ? response.error : 'Failed to retrieve courses');
        return;
      }

      const courses = response.data || [];
      state.isLoading = false;

      if (coursesCountEl) {
        coursesCountEl.textContent = `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} available`;
      }

      if (courses.length === 0) {
        renderEmpty();
        return;
      }

      coursesGrid.innerHTML = courses.map(renderCourseCard).join('');
    } catch (err) {
      console.error("Course fetch error:", err);
      renderError("Network communication error. Please try again.");
    }
  }

  // Event Listeners: Search (debounced)
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.search = e.target.value;
      loadCourses();
    }, 250));
  }

  // Category Buttons
  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.category || 'All';
      loadCourses();
    });
  });

  // Difficulty Filter
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      state.difficulty = e.target.value;
      loadCourses();
    });
  }

  // Sort Filter
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      loadCourses();
    });
  }

  // Initial Load
  loadCourses();
});
