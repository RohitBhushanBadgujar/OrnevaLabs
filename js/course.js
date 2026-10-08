/**
 * ORNEVA LABS - Individual Course Detail Controller
 * Dynamic loading by ?slug=..., curriculum accordion, outcomes, enroll checkout
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { $, $$, escapeHtml, formatCurrency } = window.OrnevaUtils;

  const courseDetailContainer = $('#course-detail-container');
  if (!courseDetailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    renderNotFound("No course specified. Please browse our available catalog.");
    return;
  }

  // Render Loading Skeleton
  function renderLoading() {
    courseDetailContainer.innerHTML = `
      <div style="padding: 4rem 0; text-align: center;">
        <div class="spinner-inline" style="width: 36px; height: 36px; margin-bottom: 1.5rem;"></div>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Retrieving course curriculum and details...</p>
      </div>
    `;
  }

  // Render Not Found / Error State
  function renderNotFound(message) {
    document.title = "Course Not Found | Orneva Labs";
    courseDetailContainer.innerHTML = `
      <div class="state-box state-box-error glass-card" style="margin: 4rem auto;">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 class="state-title">Course Not Found</h2>
        <p class="state-desc">${escapeHtml(message || "The requested course could not be located in our system.")}</p>
        <a href="courses.html" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Browse All Courses
        </a>
      </div>
    `;
  }

  // Render Full Course Page
  function renderCourse(course) {
    // Dynamic SEO
    document.title = `${course.title} | Orneva Labs`;
    const metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', course.subtitle || course.description);

    const outcomesList = (course.learningOutcomes || []).map(outcome => `
      <li style="display: flex; gap: 0.85rem; align-items: flex-start; margin-bottom: 0.85rem; color: var(--text-secondary); font-size: 0.95rem;">
        <span style="color: var(--success); flex-shrink: 0; margin-top: 2px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <span>${escapeHtml(outcome)}</span>
      </li>
    `).join('');

    const prereqList = (course.prerequisites || []).map(item => `
      <li style="display: flex; gap: 0.85rem; align-items: flex-start; margin-bottom: 0.85rem; color: var(--text-secondary); font-size: 0.95rem;">
        <span style="color: var(--primary); flex-shrink: 0; margin-top: 2px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <span>${escapeHtml(item)}</span>
      </li>
    `).join('');

    const toolsTags = (course.tools || []).map(t => `
      <span class="tool-tag" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">${escapeHtml(t)}</span>
    `).join('');

    const curriculumAccordion = (course.curriculum || []).map((mod, idx) => `
      <div class="glass-card faq-item ${idx === 0 ? 'open' : ''}" style="margin-bottom: 1rem; border-radius: 14px;">
        <button class="faq-question" style="padding: 1.25rem 1.5rem; font-size: 1rem;" type="button">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="width: 28px; height: 28px; border-radius: 8px; background: var(--primary-subtle); color: var(--primary); font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
              ${idx + 1}
            </span>
            <span>${escapeHtml(mod.title)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 500;">${escapeHtml(mod.duration || '')}</span>
            <span class="faq-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </button>
        <div class="faq-answer" style="padding: 0 1.5rem 1.25rem;">
          <ul style="list-style: disc; padding-left: 2rem; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.8;">
            ${(mod.topics || []).map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    courseDetailContainer.innerHTML = `
      <div class="course-detail-layout" style="display: grid; grid-template-columns: 1fr 380px; gap: 3.5rem; align-items: start; padding: 3rem 0 5rem;">
        
        <!-- Left: Course Overview & Content -->
        <div class="course-main-content">
          <!-- Badges & Category -->
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem;">
            <span class="badge badge-orange">${escapeHtml(course.category)}</span>
            <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary);">${escapeHtml(course.difficulty)}</span>
            <span class="meta-item" style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${escapeHtml(course.duration)} Total Sprint
            </span>
          </div>

          <h1 class="heading-lg" style="margin-bottom: 1rem; line-height: 1.2;">${escapeHtml(course.title)}</h1>
          <p class="lead-text" style="font-size: 1.15rem; margin-bottom: 2rem; color: #cbd5e1;">${escapeHtml(course.subtitle || '')}</p>

          <!-- Course Banner Image -->
          <div style="border-radius: 18px; overflow: hidden; margin-bottom: 2.5rem; border: 1px solid var(--border-color); box-shadow: var(--card-shadow);">
            <img src="${escapeHtml(course.thumbnail || 'assets/courses/course-ai-app.jpg')}" alt="${escapeHtml(course.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;" />
          </div>

          <!-- Description Section -->
          <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">About This Course</h3>
            <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">${escapeHtml(course.description)}</p>

            <h4 style="font-size: 1.05rem; margin-bottom: 1rem; color: var(--text-primary);">Tools & Technologies Used</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${toolsTags}
            </div>
          </div>

          <!-- Deliverable Project Showcase (Learn -> Build -> Prove) -->
          <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2rem; border-color: var(--primary-border); background: linear-gradient(135deg, rgba(255,87,34,0.06) 0%, rgba(16,19,26,0.85) 100%);">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <span class="badge badge-orange">The "Prove" Deliverable</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Tangible Outcome</span>
            </div>
            <h3 style="font-size: 1.3rem; margin-bottom: 0.75rem;">What You Will Actually Build</h3>
            <p style="color: #ffccbc; font-size: 1rem; line-height: 1.6;">${escapeHtml(course.project || 'A live, portfolio-ready production deliverable.')}</p>
          </div>

          <!-- Curriculum Breakdown -->
          <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.35rem;">Curriculum & Sprint Modules</h3>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${(course.curriculum || []).length} structured phases</span>
            </div>
            <div class="curriculum-accordion-list">
              ${curriculumAccordion}
            </div>
          </div>

          <!-- Outcomes & Prerequisites Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; margin-bottom: 2rem;">
            <div class="glass-card" style="padding: 2rem;">
              <h4 style="font-size: 1.1rem; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--success);">&#10003;</span> What You'll Master
              </h4>
              <ul style="list-style: none;">
                ${outcomesList}
              </ul>
            </div>

            <div class="glass-card" style="padding: 2rem;">
              <h4 style="font-size: 1.1rem; margin-bottom: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--primary);">&#9679;</span> Prerequisites
              </h4>
              <ul style="list-style: none;">
                ${prereqList}
              </ul>
            </div>
          </div>
        </div>

        <!-- Right: Sticky Enrollment Card -->
        <aside class="course-sidebar" style="position: sticky; top: 100px;">
          <div class="glass-card" style="padding: 2.25rem; border-color: rgba(255, 87, 34, 0.35); box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 25px rgba(255,87,34,0.12);">
            
            <div style="margin-bottom: 1.5rem; text-align: left;">
              <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em;">Full Lifetime Access</span>
              <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-top: 0.35rem;">
                <span style="font-size: 2.5rem; font-weight: 800; color: #ffffff;">${formatCurrency(course.price)}</span>
                <span style="font-size: 0.95rem; color: var(--text-muted); text-decoration: line-through;">₹${(course.price * 2.5).toFixed(0)}</span>
                <span class="badge badge-green" style="font-size: 0.7rem;">60% OFF</span>
              </div>
            </div>

            <a href="payment.html?courseId=${encodeURIComponent(course.courseId)}&slug=${encodeURIComponent(course.slug)}" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.05rem; margin-bottom: 1.25rem;">
              Enroll Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>

            <div style="font-size: 0.82rem; color: var(--text-muted); text-align: center; margin-bottom: 1.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Direct UPI payment with fast manual admin verification</span>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <h5 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 1rem;">This micro-sprint includes:</h5>
              <ul style="list-style: none; font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.75rem;">
                <li style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="color: var(--primary);">&#10003;</span> ${escapeHtml(course.duration)} on-demand hands-on lessons
                </li>
                <li style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="color: var(--primary);">&#10003;</span> 1 tangible capstone portfolio project
                </li>
                <li style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="color: var(--primary);">&#10003;</span> Downloadable code & resource templates
                </li>
                <li style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="color: var(--primary);">&#10003;</span> Verified student proof of completion
                </li>
                <li style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="color: var(--primary);">&#10003;</span> Direct founder support & community
                </li>
              </ul>
            </div>

          </div>
        </aside>

      </div>
    `;

    // Re-bind accordion clicks for this dynamically rendered curriculum
    courseDetailContainer.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (item) item.classList.toggle('open');
      });
    });
  }

  // Load Course
  renderLoading();
  try {
    const res = await window.OrnevaAPI.getCourseBySlug(slug);
    if (!res || !res.success || !res.data) {
      renderNotFound(res ? res.error : "Course could not be loaded.");
      return;
    }
    renderCourse(res.data);
  } catch (e) {
    console.error("Course detail error:", e);
    renderNotFound("A network failure prevented loading this course. Please try again.");
  }
});
