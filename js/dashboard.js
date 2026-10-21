/**
 * ORNEVA LABS - Student Dashboard Controller
 * Enrolled courses, dynamic progress tracking, interactive module completion, and payments status
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { $, $$, escapeHtml, formatCurrency, formatDate, showToast } = window.OrnevaUtils;

  const dashboardContainer = $('#student-dashboard-content');
  if (!dashboardContainer) return; // Not on dashboard.html

  // Enforce Student Auth Guard
  const student = window.OrnevaAuth.getStudent();
  if (!student || !student.studentId) {
    window.location.href = `login.html?redirect=dashboard.html`;
    return;
  }

  // Update Welcome Banner & Avatar
  const studentNameEl = $('#student-welcome-name');
  if (studentNameEl) studentNameEl.textContent = student.name;

  const studentEmailEl = $('#student-welcome-email');
  if (studentEmailEl) studentEmailEl.textContent = student.email;

  const avatarSlot = $('#student-avatar-slot');
  if (avatarSlot) {
    if (student.photoURL) {
      avatarSlot.innerHTML = `<img src="${escapeHtml(student.photoURL)}" alt="${escapeHtml(student.name)}" style="width: 58px; height: 58px; border-radius: 50%; border: 2.5px solid var(--primary); object-fit: cover; box-shadow: 0 4px 15px rgba(255,87,34,0.25);" />`;
    } else {
      const initial = student.name ? student.name.charAt(0).toUpperCase() : 'S';
      avatarSlot.innerHTML = `<div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #ff784e 100%); color: #fff; font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255,87,34,0.3); border: 2px solid rgba(255,255,255,0.15);">${escapeHtml(initial)}</div>`;
    }
  }

  // Render Skeleton Loading
  function renderLoading() {
    dashboardContainer.innerHTML = `
      <div style="padding: 4rem 0; text-align: center;">
        <div class="spinner-inline" style="width: 36px; height: 36px; margin-bottom: 1.5rem;"></div>
        <p style="color: var(--text-muted);">Loading your enrolled courses & learning progress...</p>
      </div>
    `;
  }

  // Render Empty State
  function renderEmpty() {
    dashboardContainer.innerHTML = `
      <div class="state-box state-box-empty glass-card" style="margin: 3rem auto;">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <h3 class="state-title">You haven't enrolled in a course yet.</h3>
        <p class="state-desc">Explore our practical micro-courses and build your first real project today.</p>
        <a href="courses.html" class="btn btn-primary">Explore Courses</a>
      </div>
    `;
  }

  // Load Enrollments
  async function loadDashboard() {
    renderLoading();
    try {
      const res = await window.OrnevaAPI.getStudentEnrollments(student.studentId, student.email);
      if (!res || !res.success) {
        dashboardContainer.innerHTML = `
          <div class="state-box state-box-error glass-card">
            <h3 class="state-title">Error Loading Courses</h3>
            <p class="state-desc">${escapeHtml(res ? res.error : "Failed to load dashboard data.")}</p>
            <button id="retry-dashboard-btn" class="btn btn-primary">Retry</button>
          </div>
        `;
        $('#retry-dashboard-btn').addEventListener('click', loadDashboard);
        return;
      }

      const items = res.data || [];
      if (items.length === 0) {
        renderEmpty();
        return;
      }

      renderEnrollmentCards(items);
    } catch (e) {
      console.error("Dashboard error:", e);
      dashboardContainer.innerHTML = `
        <div class="state-box state-box-error glass-card">
          <h3 class="state-title">Network Communication Error</h3>
          <p class="state-desc">Could not connect to the course server. Please check your connection.</p>
          <button id="retry-dashboard-btn" class="btn btn-primary">Retry</button>
        </div>
      `;
      $('#retry-dashboard-btn').addEventListener('click', loadDashboard);
    }
  }

  // Render Enrolled Cards
  function renderEnrollmentCards(items) {
    const cardsHtml = items.map(item => {
      const course = item.course || {};
      const isConfirmed = item.status === 'ACTIVE';
      const isPending = item.status === 'PENDING_APPROVAL';
      const progress = item.progress || { percentage: 0, completedModules: 0, totalModules: 0 };

      const statusBadge = isConfirmed
        ? `<span class="badge badge-green">Enrolled & Active</span>`
        : isPending
        ? `<span class="badge badge-yellow">Verification Pending</span>`
        : `<span class="badge badge-orange">Status: ${escapeHtml(item.status)}</span>`;

      return `
        <article class="glass-card" style="padding: 1.75rem; border-radius: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
              <span class="badge badge-orange">${escapeHtml(course.category || 'General')}</span>
              ${statusBadge}
            </div>

            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem;">
              <img src="${escapeHtml(course.thumbnail || 'assets/courses/course-ai-app.jpg')}" alt="${escapeHtml(course.title)}" style="width: 70px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" />
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; line-height: 1.3;">${escapeHtml(course.title || 'Course')}</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(course.duration || '')} Total</span>
              </div>
            </div>

            <!-- Progress Indicator (if active) -->
            ${isConfirmed ? `
              <div style="margin: 1.5rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.5rem;">
                  <span style="color: var(--text-secondary);">Course Progress</span>
                  <span style="font-weight: 700; color: #ff8a65;">${progress.percentage}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden;">
                  <div style="width: ${progress.percentage}%; height: 100%; background: var(--gradient-primary); border-radius: 100px; transition: width 0.4s ease;"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">
                  ${progress.completedModules} of ${progress.totalModules} modules completed
                </div>
              </div>
            ` : `
              <div style="padding: 1rem; background: rgba(245, 158, 11, 0.06); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 12px; margin: 1.25rem 0; font-size: 0.85rem; color: #fde68a;">
                Your payment (Ref: <code style="font-family: monospace;">${escapeHtml(item.transactionId)}</code>) is currently awaiting manual review by our team. Access will unlock automatically once verified!
              </div>
            `}
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; display: flex; align-items: center; justify-content: space-between; margin-top: 1rem;">
            ${isConfirmed ? `
              <button class="btn btn-primary btn-learn-action" data-course-id="${escapeHtml(course.courseId)}" style="width: 100%; padding: 0.75rem;">
                Continue Learning
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            ` : `
              <a href="payment-pending.html?txn=${encodeURIComponent(item.transactionId)}" class="btn btn-secondary" style="width: 100%; padding: 0.75rem; font-size: 0.85rem;">
                Check Verification Status
              </a>
            `}
          </div>
        </article>
      `;
    }).join('');

    dashboardContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 2rem;">
        ${cardsHtml}
      </div>
    `;

    // Attach click listeners to "Continue Learning"
    $$('.btn-learn-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.dataset.courseId;
        const targetItem = items.find(i => (i.course && i.course.courseId === cId));
        if (targetItem) openLearningModal(targetItem);
      });
    });
  }

  // Interactive Learning Viewer Modal
  async function openLearningModal(item) {
    const course = item.course;
    const curriculum = course.curriculum || [];
    
    // Fetch latest progress
    const prgRes = await window.OrnevaAPI.getProgress(student.studentId, course.courseId);
    const progressList = prgRes.success ? prgRes.data : [];

    let modal = document.getElementById('learning-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'learning-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 760px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-orange" style="margin-bottom: 0.35rem;">Interactive Learning Sprint</span>
            <h3 style="font-size: 1.25rem;">${escapeHtml(course.title)}</h3>
          </div>
          <button class="modal-close-btn" id="close-learning-modal">&times;</button>
        </div>

        <div class="modal-body">
          <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.75rem; border: 1px solid var(--border-color);">
            <h4 style="font-size: 0.95rem; color: #ff8a65; margin-bottom: 0.25rem;">Capstone Deliverable Project</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${escapeHtml(course.project || '')}</p>
          </div>

          <h4 style="font-size: 1rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Modules & Progress Checklist</h4>
          
          <div class="module-checklist-wrap" style="display: flex; flex-direction: column; gap: 1rem;">
            ${curriculum.map((mod, i) => {
              const isChecked = progressList.some(p => p.moduleId === mod.id && p.completed);
              return `
                <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; border-radius: 14px; background: rgba(255,255,255,0.02);">
                  <input type="checkbox" id="chk_${mod.id}" data-mod-id="${mod.id}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary); margin-top: 3px; cursor: pointer;" />
                  <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                      <label for="chk_${mod.id}" style="font-weight: 600; font-size: 0.95rem; cursor: pointer; color: ${isChecked ? '#a0aec0' : '#ffffff'}; text-decoration: ${isChecked ? 'line-through' : 'none'};">
                        ${i + 1}. ${escapeHtml(mod.title)}
                      </label>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(mod.duration || '')}</span>
                    </div>
                    <ul style="font-size: 0.82rem; color: var(--text-muted); list-style: disc; padding-left: 1.25rem;">
                      ${(mod.topics || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="done-learning-modal">Close & Save</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => {
      modal.classList.remove('active');
      loadDashboard(); // Refresh progress in background
    };

    $('#close-learning-modal').addEventListener('click', closeModal);
    $('#done-learning-modal').addEventListener('click', closeModal);

    // Module checkbox toggles
    modal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const modId = e.target.dataset.modId;
        const checked = e.target.checked;
        const label = modal.querySelector(`label[for="chk_${modId}"]`);
        if (label) {
          label.style.textDecoration = checked ? 'line-through' : 'none';
          label.style.color = checked ? '#a0aec0' : '#ffffff';
        }

        try {
          await window.OrnevaAPI.updateProgress(student.studentId, course.courseId, modId, checked);
          showToast(checked ? "Module marked as completed!" : "Module marked incomplete", "info", 2000);
        } catch (err) {
          console.error("Progress update failed:", err);
        }
      });
    });
  }

  // Initialize
  loadDashboard();
});
