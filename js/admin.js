/**
 * ORNEVA LABS - Admin Portal Controller
 * Complete Back-Office System: Stats, Courses CRUD, Payment Verification,
 * Students, Enrollments, System Settings, Audit Logs
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { $, $$, escapeHtml, formatCurrency, formatDate, formatDateTime, showToast } = window.OrnevaUtils;

  // Enforce Admin Auth Guard
  const admin = window.OrnevaAuth.getAdmin();
  if (!admin || !admin.token) {
    window.location.href = "admin-login.html";
    return;
  }

  // Update Admin Info in Sidebar
  const adminEmailEl = $('#admin-email-display');
  if (adminEmailEl) adminEmailEl.textContent = admin.email;

  // Handle Admin Logout
  const logoutBtn = $('#admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.OrnevaAuth.logoutAdmin();
    });
  }

  // Mobile Admin Sidebar Toggle
  const sidebarToggle = $('#admin-sidebar-toggle');
  const sidebar = $('.admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Navigation Tabs Switching
  const navItems = $$('.admin-nav-item');
  const panels = $$('.admin-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPanelId = item.dataset.target;
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = $(`#${targetPanelId}`);
      if (targetPanel) targetPanel.classList.add('active');

      // Refresh view data
      if (targetPanelId === 'panel-dashboard') loadDashboardStats();
      else if (targetPanelId === 'panel-courses') loadCoursesTable();
      else if (targetPanelId === 'panel-payments') loadPaymentsTable();
      else if (targetPanelId === 'panel-students') loadStudentsTable();
      else if (targetPanelId === 'panel-enrollments') loadEnrollmentsTable();
      else if (targetPanelId === 'panel-settings') loadSettings();
      else if (targetPanelId === 'panel-logs') loadLogsTable();

      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // =========================================================================
  // 1. DASHBOARD OVERVIEW & STATS
  // =========================================================================
  async function loadDashboardStats() {
    try {
      const res = await window.OrnevaAPI.getAdminStats(admin.token);
      if (!res || !res.success) return;
      const s = res.data;

      // Update counters
      $('#stat-total-courses').textContent = s.totalCourses;
      $('#stat-total-students').textContent = s.totalStudents;
      $('#stat-active-enrollments').textContent = s.activeEnrollments;
      $('#stat-pending-payments').textContent = s.pendingPayments;
      $('#stat-verified-payments').textContent = s.verifiedPayments;
      $('#stat-total-revenue').textContent = formatCurrency(s.totalRevenue); // VERIFIED ONLY

      // Load Quick Pending Payments Table on Overview
      const pRes = await window.OrnevaAPI.getPayments(admin.token, { status: 'PENDING' });
      const pendingList = pRes.success ? pRes.data.slice(0, 5) : [];
      const quickTableBody = $('#dashboard-pending-tbody');

      if (quickTableBody) {
        if (pendingList.length === 0) {
          quickTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No pending payments! All caught up.</td></tr>`;
        } else {
          quickTableBody.innerHTML = pendingList.map(p => `
            <tr>
              <td><code>${escapeHtml(p.transactionId)}</code></td>
              <td><strong>${escapeHtml(p.studentName)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(p.studentEmail)}</small></td>
              <td>${escapeHtml(p.courseTitle)}</td>
              <td><strong>${formatCurrency(p.amount)}</strong></td>
              <td><span class="status-pill status-pending">PENDING</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-ghost-sm btn-view-proof" data-txn="${escapeHtml(p.transactionId)}">Review</button>
                  <button class="btn btn-ghost-sm btn-verify-action" data-txn="${escapeHtml(p.transactionId)}">Verify</button>
                </div>
              </td>
            </tr>
          `).join('');

          attachPaymentActionListeners(quickTableBody);
        }
      }
    } catch (e) {
      console.error("Dashboard stats error:", e);
    }
  }

  // =========================================================================
  // 2. COURSES MANAGEMENT (CRUD)
  // =========================================================================
  async function loadCoursesTable() {
    const tbody = $('#courses-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;"><div class="spinner-inline"></div></td></tr>`;

    try {
      const res = await window.OrnevaAPI.getCourses({ includeUnpublished: true });
      if (!res || !res.success) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load courses.</td></tr>`;
        return;
      }

      const courses = res.data || [];
      if (courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No courses in database. Click 'Add Course' to create one.</td></tr>`;
        return;
      }

      tbody.innerHTML = courses.map(c => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <img src="${escapeHtml(c.thumbnail || 'assets/courses/course-ai-app.jpg')}" alt="${escapeHtml(c.title)}" style="width: 48px; height: 32px; object-fit: cover; border-radius: 6px;" />
              <div>
                <strong>${escapeHtml(c.title)}</strong><br>
                <code style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(c.slug)}</code>
              </div>
            </div>
          </td>
          <td><span class="badge badge-orange">${escapeHtml(c.category)}</span></td>
          <td>${escapeHtml(c.difficulty)}</td>
          <td>${escapeHtml(c.duration)}</td>
          <td><strong>${formatCurrency(c.price)}</strong></td>
          <td>
            <button class="btn-toggle-publish ${c.published !== false ? 'status-pill status-verified' : 'status-pill status-rejected'}" data-id="${c.courseId}" data-status="${c.published !== false}" style="cursor: pointer; border: none;">
              ${c.published !== false ? 'Published' : 'Draft'}
            </button>
          </td>
          <td>
            <div class="action-btns">
              <button class="btn-icon-action btn-edit-course" data-id="${c.courseId}" title="Edit Course">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon-action btn-delete-course" data-id="${c.courseId}" title="Delete Course" style="color: var(--danger);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      // Attach Courses Listeners
      $$('.btn-toggle-publish', tbody).forEach(btn => {
        btn.addEventListener('click', async () => {
          const courseId = btn.dataset.id;
          const currentPublished = btn.dataset.status === 'true';
          await window.OrnevaAPI.updateCourse(courseId, { published: !currentPublished }, admin.token);
          showToast(`Course ${!currentPublished ? 'published' : 'moved to draft'}!`, 'info');
          loadCoursesTable();
        });
      });

      $$('.btn-edit-course', tbody).forEach(btn => {
        btn.addEventListener('click', () => {
          const target = courses.find(c => c.courseId === btn.dataset.id);
          if (target) openCourseModal(target);
        });
      });

      $$('.btn-delete-course', tbody).forEach(btn => {
        btn.addEventListener('click', async () => {
          const target = courses.find(c => c.courseId === btn.dataset.id);
          if (!target) return;
          if (confirm(`Are you sure you want to delete course "${target.title}"? This cannot be undone.`)) {
            await window.OrnevaAPI.deleteCourse(target.courseId, admin.token);
            showToast("Course deleted successfully.", "info");
            loadCoursesTable();
            loadDashboardStats();
          }
        });
      });

    } catch (e) {
      console.error("Courses table error:", e);
    }
  }

  // Course Modal (Create & Edit)
  const courseModal = $('#course-modal');
  const courseForm = $('#course-modal-form');
  const addCourseBtn = $('#btn-add-course');

  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => openCourseModal(null));
  }

  function openCourseModal(courseToEdit = null) {
    if (!courseModal) return;
    const isEdit = !!courseToEdit;
    $('#course-modal-title').textContent = isEdit ? "Edit Course" : "Create New Course";
    $('#course-id-input').value = isEdit ? courseToEdit.courseId : '';
    $('#c-title').value = isEdit ? courseToEdit.title : '';
    $('#c-slug').value = isEdit ? courseToEdit.slug : '';
    $('#c-subtitle').value = isEdit ? courseToEdit.subtitle : '';
    $('#c-description').value = isEdit ? courseToEdit.description : '';
    $('#c-category').value = isEdit ? courseToEdit.category : 'AI';
    $('#c-difficulty').value = isEdit ? courseToEdit.difficulty : 'Beginner';
    $('#c-duration').value = isEdit ? courseToEdit.duration : '3.0 Hours';
    $('#c-price').value = isEdit ? courseToEdit.price : 499;
    $('#c-thumbnail').value = isEdit ? courseToEdit.thumbnail : 'assets/courses/course-ai-app.jpg';
    $('#c-project').value = isEdit ? courseToEdit.project : '';
    $('#c-tools').value = isEdit ? (courseToEdit.tools || []).join(', ') : 'AI APIs, HTML, CSS, JavaScript';
    $('#c-outcomes').value = isEdit ? (courseToEdit.learningOutcomes || []).join('\n') : '';
    $('#c-prerequisites').value = isEdit ? (courseToEdit.prerequisites || []).join('\n') : '';
    $('#c-published').checked = isEdit ? courseToEdit.published !== false : true;

    courseModal.classList.add('active');
  }

  $('#close-course-modal').addEventListener('click', () => courseModal.classList.remove('active'));
  $('#cancel-course-modal').addEventListener('click', () => courseModal.classList.remove('active'));

  if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const courseId = $('#course-id-input').value;
      const isEdit = !!courseId;

      const coursePayload = {
        title: $('#c-title').value.trim(),
        slug: $('#c-slug').value.trim(),
        subtitle: $('#c-subtitle').value.trim(),
        description: $('#c-description').value.trim(),
        category: $('#c-category').value,
        difficulty: $('#c-difficulty').value,
        duration: $('#c-duration').value.trim(),
        price: Number($('#c-price').value) || 299,
        thumbnail: $('#c-thumbnail').value.trim() || 'assets/courses/course-ai-app.jpg',
        project: $('#c-project').value.trim(),
        tools: $('#c-tools').value.split(',').map(t => t.trim()).filter(Boolean),
        learningOutcomes: $('#c-outcomes').value.split('\n').map(o => o.trim()).filter(Boolean),
        prerequisites: $('#c-prerequisites').value.split('\n').map(p => p.trim()).filter(Boolean),
        published: $('#c-published').checked
      };

      if (isEdit) {
        await window.OrnevaAPI.updateCourse(courseId, coursePayload, admin.token);
        showToast("Course updated successfully!", "success");
      } else {
        const createRes = await window.OrnevaAPI.createCourse(coursePayload, admin.token);
        if (!createRes.success) {
          showToast(createRes.error, "error");
          return;
        }
        showToast("New course launched successfully!", "success");
      }

      courseModal.classList.remove('active');
      loadCoursesTable();
      loadDashboardStats();
    });
  }

  // =========================================================================
  // 3. PAYMENTS MANAGEMENT & VERIFICATION
  // =========================================================================
  let currentPaymentsList = [];

  async function loadPaymentsTable() {
    const tbody = $('#payments-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;"><div class="spinner-inline"></div></td></tr>`;

    const statusFilter = $('#payment-status-filter') ? $('#payment-status-filter').value : 'All';
    const searchQuery = $('#payment-search-input') ? $('#payment-search-input').value : '';

    try {
      const res = await window.OrnevaAPI.getPayments(admin.token, { status: statusFilter, search: searchQuery });
      if (!res || !res.success) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger);">Failed to load payments.</td></tr>`;
        return;
      }

      currentPaymentsList = res.data || [];
      if (currentPaymentsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching payment records found.</td></tr>`;
        return;
      }

      tbody.innerHTML = currentPaymentsList.map(p => {
        const statusClass = {
          VERIFIED: 'status-verified',
          PENDING: 'status-pending',
          REJECTED: 'status-rejected'
        }[p.paymentStatus] || 'status-pending';

        return `
          <tr>
            <td><code>${escapeHtml(p.transactionId)}</code></td>
            <td>
              <strong>${escapeHtml(p.studentName)}</strong><br>
              <small style="color: var(--text-muted);">${escapeHtml(p.studentEmail)}</small><br>
              <small style="color: var(--text-muted);">${escapeHtml(p.studentPhone)}</small>
            </td>
            <td>${escapeHtml(p.courseTitle)}</td>
            <td><strong>${formatCurrency(p.amount)}</strong></td>
            <td><code>${escapeHtml(p.utrNumber || '—')}</code></td>
            <td>${formatDateTime(p.timestamp)}</td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(p.paymentStatus)}</span></td>
            <td><span class="status-pill ${p.enrollmentStatus === 'CONFIRMED' ? 'status-verified' : 'status-pending'}">${escapeHtml(p.enrollmentStatus)}</span></td>
            <td>
              <div class="action-btns">
                <button class="btn btn-ghost-sm btn-view-proof" data-txn="${escapeHtml(p.transactionId)}" title="Review Payment">Review</button>
                ${p.paymentStatus === 'PENDING' ? `
                  <button class="btn-icon-action btn-verify-action" data-txn="${escapeHtml(p.transactionId)}" title="Verify & Grant Access" style="color: var(--success);">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button class="btn-icon-action btn-reject-action" data-txn="${escapeHtml(p.transactionId)}" title="Reject" style="color: var(--danger);">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      attachPaymentActionListeners(tbody);
    } catch (e) {
      console.error("Payments load error:", e);
    }
  }

  function attachPaymentActionListeners(container) {
    // Review Proof Modal
    $$('.btn-view-proof', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const txnId = btn.dataset.txn;
        const targetPayment = currentPaymentsList.find(p => p.transactionId === txnId);
        if (targetPayment) openPaymentReviewModal(targetPayment);
      });
    });

    // Verify Action
    $$('.btn-verify-action', container).forEach(btn => {
      btn.addEventListener('click', async () => {
        const txnId = btn.dataset.txn;
        if (confirm(`Confirm and VERIFY payment for transaction ${txnId}? This will activate the student's enrollment and grant instant course access.`)) {
          const res = await window.OrnevaAPI.updatePaymentStatus(txnId, 'VERIFIED', 'Verified by admin', admin.token);
          if (res.success) {
            showToast(`Transaction ${txnId} VERIFIED! Enrollment active.`, "success");
            loadPaymentsTable();
            loadDashboardStats();
          }
        }
      });
    });

    // Reject Action
    $$('.btn-reject-action', container).forEach(btn => {
      btn.addEventListener('click', async () => {
        const txnId = btn.dataset.txn;
        const reason = prompt(`Enter rejection reason for transaction ${txnId}:`, "UTR mismatch or payment not received");
        if (reason !== null) {
          const res = await window.OrnevaAPI.updatePaymentStatus(txnId, 'REJECTED', reason, admin.token);
          if (res.success) {
            showToast(`Transaction ${txnId} marked as REJECTED.`, "warning");
            loadPaymentsTable();
            loadDashboardStats();
          }
        }
      });
    });
  }

  // Payment Review Modal
  const paymentReviewModal = $('#payment-review-modal');
  function openPaymentReviewModal(p) {
    if (!paymentReviewModal) return;

    $('#review-txn-id').textContent = p.transactionId;
    $('#review-student-name').textContent = p.studentName;
    $('#review-student-email').textContent = p.studentEmail;
    $('#review-student-phone').textContent = p.studentPhone || '—';
    $('#review-course-title').textContent = p.courseTitle;
    $('#review-amount').textContent = formatCurrency(p.amount);
    $('#review-utr').textContent = p.utrNumber || 'Not provided';
    $('#review-status').textContent = p.paymentStatus;
    $('#review-status').className = `status-pill ${p.paymentStatus === 'VERIFIED' ? 'status-verified' : p.paymentStatus === 'REJECTED' ? 'status-rejected' : 'status-pending'}`;
    $('#review-date').textContent = formatDateTime(p.timestamp);

    const proofWrap = $('#review-proof-container');
    if (p.paymentProof && p.paymentProof.startsWith('data:image')) {
      proofWrap.innerHTML = `
        <img src="${p.paymentProof}" alt="Payment Proof" style="max-width: 100%; max-height: 320px; object-fit: contain; border-radius: 10px; border: 1px solid var(--border-color);" />
      `;
    } else {
      proofWrap.innerHTML = `
        <div style="padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 10px; color: var(--text-secondary); font-size: 0.9rem;">
          ${escapeHtml(p.paymentProof || 'No screenshot uploaded. Reference: ' + (p.utrNumber || 'N/A'))}
        </div>
      `;
    }

    // Modal action buttons
    const verifyModalBtn = $('#modal-verify-btn');
    const rejectModalBtn = $('#modal-reject-btn');

    if (verifyModalBtn) {
      verifyModalBtn.onclick = async () => {
        await window.OrnevaAPI.updatePaymentStatus(p.transactionId, 'VERIFIED', 'Verified via review modal', admin.token);
        showToast("Payment verified successfully!", "success");
        paymentReviewModal.classList.remove('active');
        loadPaymentsTable();
        loadDashboardStats();
      };
    }

    if (rejectModalBtn) {
      rejectModalBtn.onclick = async () => {
        const reason = prompt("Enter rejection reason:", "Proof invalid or payment not received");
        if (reason) {
          await window.OrnevaAPI.updatePaymentStatus(p.transactionId, 'REJECTED', reason, admin.token);
          showToast("Payment rejected.", "warning");
          paymentReviewModal.classList.remove('active');
          loadPaymentsTable();
          loadDashboardStats();
        }
      };
    }

    paymentReviewModal.classList.add('active');
  }

  $('#close-review-modal').addEventListener('click', () => paymentReviewModal.classList.remove('active'));
  $('#dismiss-review-modal').addEventListener('click', () => paymentReviewModal.classList.remove('active'));

  // Payments filter controls
  if ($('#payment-status-filter')) {
    $('#payment-status-filter').addEventListener('change', loadPaymentsTable);
  }
  if ($('#payment-search-input')) {
    $('#payment-search-input').addEventListener('input', window.OrnevaUtils.debounce(loadPaymentsTable, 300));
  }

  // =========================================================================
  // 4. STUDENTS LIST
  // =========================================================================
  async function loadStudentsTable() {
    const tbody = $('#students-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;"><div class="spinner-inline"></div></td></tr>`;

    try {
      const res = await window.OrnevaAPI.getStudents(admin.token);
      const students = res.success ? res.data : [];
      if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No registered students yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = students.map(s => `
        <tr>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.phone || '—')}</td>
          <td><span class="badge badge-green">${s.activeEnrollmentsCount || 0} active</span></td>
          <td>${formatDate(s.createdAt)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error("Students load error:", e);
    }
  }

  // =========================================================================
  // 5. ENROLLMENTS LIST
  // =========================================================================
  async function loadEnrollmentsTable() {
    const tbody = $('#enrollments-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-inline"></div></td></tr>`;

    try {
      const res = await window.OrnevaAPI.getEnrollments(admin.token);
      const enrollments = res.success ? res.data : [];
      if (enrollments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No enrollments yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = enrollments.map(e => `
        <tr>
          <td><code>${escapeHtml(e.enrollmentId)}</code></td>
          <td><strong>${escapeHtml(e.studentName)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(e.studentEmail)}</small></td>
          <td>${escapeHtml(e.courseTitle)}</td>
          <td><code>${escapeHtml(e.transactionId)}</code></td>
          <td><span class="status-pill ${e.status === 'ACTIVE' ? 'status-verified' : 'status-pending'}">${escapeHtml(e.status)}</span></td>
          <td>${formatDate(e.enrolledAt)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error("Enrollments load error:", e);
    }
  }

  // =========================================================================
  // 6. SYSTEM SETTINGS
  // =========================================================================
  async function loadSettings() {
    try {
      const res = await window.OrnevaAPI.getSettings();
      if (!res.success) return;
      const s = res.data || {};
      if ($('#set-upi-id')) $('#set-upi-id').value = s.upiId || '';
      if ($('#set-payee-name')) $('#set-payee-name').value = s.payeeName || '';
      if ($('#set-whatsapp')) $('#set-whatsapp').value = s.whatsappNumber || '';
      if ($('#set-announcement')) $('#set-announcement').value = s.announcement || '';
    } catch (e) {
      console.error("Settings load error:", e);
    }
  }

  const settingsForm = $('#settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        upiId: $('#set-upi-id').value.trim(),
        payeeName: $('#set-payee-name').value.trim(),
        whatsappNumber: $('#set-whatsapp').value.trim(),
        announcement: $('#set-announcement').value.trim()
      };
      await window.OrnevaAPI.updateSettings(updated, admin.token);
      showToast("Platform settings saved successfully!", "success");
    });
  }

  // =========================================================================
  // 7. AUDIT LOGS
  // =========================================================================
  async function loadLogsTable() {
    const tbody = $('#logs-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem;"><div class="spinner-inline"></div></td></tr>`;

    try {
      const res = await window.OrnevaAPI.getLogs(admin.token);
      const logs = res.success ? res.data : [];
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No logs found.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map(l => `
        <tr>
          <td style="white-space: nowrap;">${formatDateTime(l.timestamp)}</td>
          <td><span class="badge badge-orange">${escapeHtml(l.action)}</span></td>
          <td><code>${escapeHtml(l.user)}</code></td>
          <td style="color: var(--text-secondary);">${escapeHtml(l.details)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error("Logs load error:", e);
    }
  }

  // Initial Load Dashboard
  loadDashboardStats();
});
