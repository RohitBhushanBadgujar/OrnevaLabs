/**
 * ORNEVA LABS - Payment & Checkout Controller
 * Realistic UPI Payment Workflow with Server-Verified Price, Dynamic QR, and Proof Submission
 */

document.addEventListener('DOMContentLoaded', async () => {
  const {
    CONFIG,
    $,
    $$,
    escapeHtml,
    formatCurrency,
    generateTransactionId,
    buildUpiUri,
    generateUpiQrUrl,
    buildWhatsAppLink,
    showToast
  } = window.OrnevaUtils;

  const checkoutContainer = $('#checkout-container');
  if (!checkoutContainer) return; // Not on payment.html

  const urlParams = new URLSearchParams(window.location.search);
  const courseIdParam = urlParams.get('courseId');
  const slugParam = urlParams.get('slug');

  // Load target course
  let course = null;
  try {
    if (slugParam) {
      const res = await window.OrnevaAPI.getCourseBySlug(slugParam);
      if (res && res.success) course = res.data;
    }
    if (!course && courseIdParam) {
      const allRes = await window.OrnevaAPI.getCourses();
      if (allRes && allRes.success) {
        course = allRes.data.find(c => c.courseId === courseIdParam);
      }
    }
    if (!course) {
      // Default to first seed course if none specified
      const allRes = await window.OrnevaAPI.getCourses();
      if (allRes && allRes.success && allRes.data.length > 0) {
        course = allRes.data[0];
      }
    }
  } catch (e) {
    console.error("Failed to load course for checkout:", e);
  }

  if (!course) {
    checkoutContainer.innerHTML = `
      <div class="state-box state-box-error glass-card" style="margin: 4rem auto;">
        <h3 class="state-title">Course Not Found</h3>
        <p class="state-desc">Please choose a valid course to proceed with enrollment.</p>
        <a href="courses.html" class="btn btn-primary">Browse Courses</a>
      </div>
    `;
    return;
  }

  // Pre-fill logged in student information
  const currentStudent = window.OrnevaAuth ? window.OrnevaAuth.getStudent() : null;

  // Generate unique transaction reference for this session
  const transactionId = generateTransactionId();
  const upiUri = buildUpiUri(CONFIG.UPI_ID, CONFIG.PAYEE_NAME, course.price, transactionId, `${course.title}`);
  const qrUrl = generateUpiQrUrl(upiUri, 280);

  // Render Checkout Page
  checkoutContainer.innerHTML = `
    <div class="checkout-grid" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 3rem; align-items: start; padding: 3rem 0 5rem;">
      
      <!-- Left Column: Student Details & Payment Proof Submission -->
      <div class="checkout-form-column">
        
        <!-- Step 1: Student Information -->
        <div class="glass-card" style="padding: 2.25rem; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">1</span>
            <h3 style="font-size: 1.25rem;">Student Details</h3>
          </div>

          <form id="payment-student-form">
            <div class="form-group">
              <label class="form-label" for="student-name">Full Name *</label>
              <input type="text" id="student-name" class="form-control" placeholder="e.g. Rohit Badgujar" required value="${escapeHtml(currentStudent ? currentStudent.name : '')}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="student-email">Email Address (For Course Access) *</label>
                <input type="email" id="student-email" class="form-control" placeholder="yourname@gmail.com" required value="${escapeHtml(currentStudent ? currentStudent.email : '')}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="student-phone">WhatsApp / Phone Number *</label>
                <input type="tel" id="student-phone" class="form-control" placeholder="e.g. 9172750062" required value="${escapeHtml(currentStudent ? currentStudent.phone : '')}" />
              </div>
            </div>
          </form>
        </div>

        <!-- Step 2: Payment Verification Form -->
        <div class="glass-card" style="padding: 2.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">2</span>
            <h3 style="font-size: 1.25rem;">Submit Payment Confirmation</h3>
          </div>

          <div style="padding: 1rem 1.25rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; margin-bottom: 1.5rem; font-size: 0.88rem; color: #fde68a; display: flex; gap: 0.75rem; align-items: flex-start;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Manual Verification Note:</strong> Once you scan the QR code and complete your UPI payment, enter your 12-digit UTR/Reference ID below and upload a screenshot. Our team will verify and unlock your course dashboard.
            </div>
          </div>

          <form id="payment-proof-form">
            <div class="form-group">
              <label class="form-label" for="utr-number">12-Digit UPI UTR / Transaction Ref No. *</label>
              <input type="text" id="utr-number" class="form-control" placeholder="e.g. 429381920381 (from Google Pay / PhonePe / Paytm)" required maxlength="32" />
              <small style="color: var(--text-muted); font-size: 0.78rem;">Found in your payment app under 'UPI transaction ID' or 'UTR'</small>
            </div>

            <div class="form-group">
              <label class="form-label" for="payment-proof-file">Payment Screenshot Proof (Optional / Recommended)</label>
              <input type="file" id="payment-proof-file" class="form-control" accept="image/*" style="padding: 0.6rem 1rem;" />
              <small style="color: var(--text-muted); font-size: 0.78rem;">Upload a screenshot showing the transaction status and UTR</small>
              <div id="proof-preview-wrap" style="margin-top: 0.75rem; display: none;">
                <img id="proof-preview-img" src="" alt="Proof Preview" style="max-height: 140px; border-radius: 8px; border: 1px solid var(--border-color);" />
              </div>
            </div>

            <div class="form-group" style="margin-top: 2rem;">
              <button type="submit" id="submit-payment-btn" class="btn btn-primary" style="width: 100%; padding: 1.1rem; font-size: 1.05rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Confirm & Submit Payment Proof
              </button>
            </div>
          </form>

        </div>

      </div>

      <!-- Right Column: Order Summary & Dynamic UPI QR -->
      <aside class="checkout-summary-column">
        <div class="glass-card" style="padding: 2.25rem; border-color: var(--primary-border);">
          
          <h4 style="font-size: 1.1rem; margin-bottom: 1.25rem; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border-color);">
            Enrollment Summary
          </h4>

          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
            <img src="${escapeHtml(course.thumbnail || 'assets/courses/course-ai-app.jpg')}" alt="${escapeHtml(course.title)}" style="width: 72px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" />
            <div>
              <h5 style="font-size: 0.95rem; line-height: 1.3;">${escapeHtml(course.title)}</h5>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(course.duration)} Sprint</span>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.65rem;">
            <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
              <span>Course Tuition</span>
              <span>${formatCurrency(course.price)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
              <span>Project Certification</span>
              <span style="color: var(--success);">FREE</span>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 0.65rem; display: flex; justify-content: space-between; font-weight: 700; font-size: 1.15rem; color: #fff;">
              <span>Total Payable</span>
              <span style="color: var(--primary);">${formatCurrency(course.price)}</span>
            </div>
          </div>

          <!-- Transaction Reference -->
          <div style="margin-bottom: 1.75rem; padding: 0.85rem 1rem; background: rgba(255, 87, 34, 0.05); border: 1px dashed var(--primary-border); border-radius: 10px; text-align: center;">
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Your Unique Reference ID</span>
            <code style="font-size: 1.05rem; font-weight: 700; color: #ff8a65; font-family: monospace;">${transactionId}</code>
          </div>

          <!-- Dynamic UPI QR Code Card -->
          <div style="background: #ffffff; padding: 1.25rem; border-radius: 16px; text-align: center; margin-bottom: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
              Scan with any UPI App
            </div>
            <img src="${qrUrl}" alt="Scan UPI QR" style="width: 220px; height: 220px; object-fit: contain; margin: 0 auto; display: block;" />
            <div style="font-size: 0.82rem; color: #475569; margin-top: 0.75rem; font-weight: 600;">
              UPI ID: <strong style="color: #0f172a;">${CONFIG.UPI_ID}</strong>
            </div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
              Payee: ${CONFIG.PAYEE_NAME}
            </div>
          </div>

          <!-- Mobile Direct Intent CTA -->
          <a href="${upiUri}" class="btn btn-secondary" style="width: 100%; margin-bottom: 1rem; font-size: 0.9rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Pay directly in UPI App
          </a>

          <!-- Help on WhatsApp -->
          <div style="text-align: center;">
            <a id="whatsapp-help-btn" href="${buildWhatsAppLink(CONFIG.WHATSAPP_NUMBER, `Hi Orneva Labs, I have an issue while paying for ${course.title}. Ref: ${transactionId}`)}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>Need help paying? Contact WhatsApp</span>
            </a>
          </div>

        </div>
      </aside>

    </div>
  `;

  // Screenshot Preview Handling
  const fileInput = $('#payment-proof-file');
  const previewWrap = $('#proof-preview-wrap');
  const previewImg = $('#proof-preview-img');
  let proofBase64 = '';

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast("File size too large. Maximum 5MB allowed.", "error");
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        proofBase64 = event.target.result;
        previewImg.src = proofBase64;
        previewWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // Handle Form Submission
  const proofForm = $('#payment-proof-form');
  const submitBtn = $('#submit-payment-btn');

  if (proofForm) {
    proofForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = $('#student-name').value.trim();
      const email = $('#student-email').value.trim();
      const phone = $('#student-phone').value.trim();
      const utr = $('#utr-number').value.trim();

      if (!name || !email || !phone || !utr) {
        showToast("Please fill in all required fields including your 12-digit UTR number.", "warning");
        return;
      }

      if (utr.length < 8) {
        showToast("Please enter a valid UPI Reference / UTR Number.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-inline" style="width: 18px; height: 18px;"></span> Submitting Verification...`;

      try {
        const payload = {
          transactionId,
          studentId: currentStudent ? currentStudent.studentId : `std_${Date.now()}`,
          studentName: name,
          studentEmail: email,
          studentPhone: phone,
          courseId: course.courseId,
          utrNumber: utr,
          paymentProof: proofBase64 || `UTR Registered: ${utr}`
        };

        const result = await window.OrnevaAPI.recordPayment(payload);

        if (!result || !result.success) {
          showToast(result ? result.error : "Failed to record payment.", "error");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Confirm & Submit Payment Proof`;
          return;
        }

        showToast("Payment confirmation received! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = `payment-pending.html?txn=${encodeURIComponent(transactionId)}&course=${encodeURIComponent(course.title)}&amount=${course.price}`;
        }, 1000);

      } catch (err) {
        console.error("Submission error:", err);
        showToast("Network error submitting payment. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Confirm & Submit Payment Proof`;
      }
    });
  }
});
