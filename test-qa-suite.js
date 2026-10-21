/**
 * ORNEVA LABS - Automated QA & Integration Test Suite
 * Comprehensive End-to-End Validation
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`${colors.green}✔ PASS:${colors.reset} ${testName}`);
  } else {
    console.error(`${colors.red}✖ FAIL:${colors.reset} ${testName} - ${details}`);
  }
}

async function runTestSuite() {
  console.log(`\n${colors.cyan}====================================================`);
  console.log(`  ORNEVA LABS - FULL-STACK INTEGRATION QA TEST SUITE`);
  console.log(`====================================================${colors.reset}\n`);

  // --- TEST GROUP 1: ASSETS & FILES ---
  console.log(`${colors.yellow}[1. Static Files & Brand Assets Validation]${colors.reset}`);
  
  assert(fs.existsSync('assets/logo.png'), "Company Logo exists in /assets/logo.png");
  assert(fs.existsSync('assets/founder.png'), "Founder Photo exists in /assets/founder.png");
  assert(fs.existsSync('assets/courses/course-ai-app.jpg'), "Course 1 thumbnail exists");
  assert(fs.existsSync('assets/courses/course-chatgpt.jpg'), "Course 2 thumbnail exists");
  assert(fs.existsSync('assets/courses/course-canva.jpg'), "Course 3 thumbnail exists");
  assert(fs.existsSync('assets/courses/course-productivity.jpg'), "Course 4 thumbnail exists");
  assert(fs.existsSync('assets/courses/course-startup.jpg'), "Course 5 thumbnail exists");

  const requiredHtmlFiles = [
    'index.html',
    'courses.html',
    'course.html',
    'about.html',
    'login.html',
    'dashboard.html',
    'payment.html',
    'payment-success.html',
    'payment-pending.html',
    'payment-failed.html',
    'admin.html',
    'admin-login.html',
    '404.html'
  ];

  requiredHtmlFiles.forEach(file => {
    assert(fs.existsSync(file), `HTML Page exists: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    assert(content.includes('<title>'), `${file} contains <title> tag`);
    assert(content.includes('Orneva Labs'), `${file} contains Orneva Labs brand title`);
    assert(content.includes('css/style.css'), `${file} links to style.css`);
  });

  // --- TEST GROUP 2: BROWSER SIMULATION OF ORNEVA ENGINE ---
  console.log(`\n${colors.yellow}[2. Core Engine & API Logic Validation]${colors.reset}`);

  // Create isolated sandbox for browser JS files
  const mockLocalStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  };

  const mockSessionStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  };

  const sandbox = {
    window: {},
    document: {
      addEventListener: () => {},
      createElement: () => ({ appendChild: () => {}, querySelector: () => null }),
      body: { appendChild: () => {} },
      querySelectorAll: () => []
    },
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    crypto: require('crypto').webcrypto,
    TextEncoder: global.TextEncoder
  };

  // Evaluate utils.js
  const utilsCode = fs.readFileSync('js/utils.js', 'utf8');
  eval(`(function(window, document, localStorage, sessionStorage, crypto, TextEncoder) { ${utilsCode} })(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.sessionStorage, sandbox.crypto, sandbox.TextEncoder)`);

  const Utils = sandbox.window.OrnevaUtils;
  assert(!!Utils, "Utils library loaded successfully");
  assert(Utils.CONFIG.UPI_ID === "9172750062@fam", "Config UPI ID is 9172750062@fam");
  assert(Utils.CONFIG.WHATSAPP_NUMBER === "9172750062", "Config WhatsApp is 9172750062");

  // Test Transaction ID format
  const txnId1 = Utils.generateTransactionId();
  const txnId2 = Utils.generateTransactionId();
  assert(/^ORN-\d{8}-[A-Z0-9]{6}$/.test(txnId1), `Transaction ID matches format ORN-YYYYMMDD-XXXXXX (${txnId1})`);
  assert(txnId1 !== txnId2, "Consecutive transaction IDs are distinct");

  // Test UPI URI Builder
  const upiUri = Utils.buildUpiUri("9172750062@fam", "Orneva Labs", 499, txnId1, "Build AI App");
  assert(upiUri.includes("pa=9172750062@fam"), "UPI URI includes payee address");
  assert(upiUri.includes("am=499.00"), "UPI URI formats correct decimal amount");
  assert(upiUri.includes(`tr=${txnId1}`), "UPI URI includes transaction reference");

  // Test WhatsApp Link
  const waLink = Utils.buildWhatsAppLink("9172750062", "Hi Orneva Labs");
  assert(waLink.includes("wa.me/919172750062"), "WhatsApp link targets correct official phone number");

  // Test Password Hash
  const hash1 = await Utils.hashPassword("my_secret_pass");
  const hash2 = await Utils.hashPassword("my_secret_pass");
  const hash3 = await Utils.hashPassword("different_pass");
  assert(typeof hash1 === 'string' && hash1.length >= 32, "Password hashing produces secure hash string");
  assert(hash1 === hash2, "Identical passwords generate identical hashes");
  assert(hash1 !== hash3, "Different passwords generate distinct hashes");

  // Evaluate api.js
  const apiCode = fs.readFileSync('js/api.js', 'utf8');
  eval(`(function(window, document, localStorage, sessionStorage, crypto, TextEncoder) { ${apiCode} })(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.sessionStorage, sandbox.crypto, sandbox.TextEncoder)`);

  const API = sandbox.window.OrnevaAPI;
  assert(!!API, "Universal API layer initialized successfully");

  // 1. Get Courses Test
  const coursesRes = await API.getCourses();
  assert(coursesRes.success === true, "API.getCourses returns success");
  assert(Array.isArray(coursesRes.data) && coursesRes.data.length === 5, "Database contains exactly 5 seeded flagship courses");

  const aiCourse = coursesRes.data.find(c => c.slug === "build-your-first-ai-app");
  assert(!!aiCourse, "Flagship course 'Build Your First AI App' exists");
  assert(aiCourse.price === 499, "Course price is ₹499");
  assert(Array.isArray(aiCourse.curriculum) && aiCourse.curriculum.length === 4, "Curriculum contains 4 phases");
  assert(!!aiCourse.project, "Course includes tangible capstone project definition");

  // 2. Filter & Search Test
  const filteredAI = await API.getCourses({ category: "AI" });
  assert(filteredAI.data.length === 2, "Category filter 'AI' returns 2 AI courses");

  const searchRes = await API.getCourses({ search: "Notion" });
  assert(searchRes.data.some(c => c.slug === "ai-productivity-system"), "Search query 'Notion' finds AI Productivity System");

  // 3. Get Course by Slug Test
  const slugRes = await API.getCourseBySlug("chatgpt-mastery-for-students");
  assert(slugRes.success === true, "Found course by slug 'chatgpt-mastery-for-students'");
  assert(slugRes.data.price === 299, "ChatGPT Mastery price is ₹299");

  const invalidSlugRes = await API.getCourseBySlug("non-existent-course-slug");
  assert(invalidSlugRes.success === false, "Invalid slug returns success: false with friendly error");

  // 4. Student Registration & Login Test
  const regEmail = `student_${Date.now()}@test.com`;
  const regRes = await API.studentRegister({
    name: "Aman Sharma",
    email: regEmail,
    phone: "9876543210",
    password: "secure_pass_123"
  });
  assert(regRes.success === true, "Student registration succeeded");
  assert(regRes.data.email === regEmail, "Student email matches registered email");

  // Duplicate registration test
  const dupReg = await API.studentRegister({
    name: "Aman Sharma",
    email: regEmail,
    phone: "9876543210",
    password: "another_pass"
  });
  assert(dupReg.success === false, "Duplicate student registration is prevented");

  // Student Login Test
  const loginRes = await API.studentLogin({ email: regEmail, password: "secure_pass_123" });
  assert(loginRes.success === true, "Student login succeeded with correct credentials");

  const badLogin = await API.studentLogin({ email: regEmail, password: "wrong_password" });
  assert(badLogin.success === false, "Student login rejected with incorrect password");

  // 5. Payment Workflow & Tampering Protection
  const testTxn = Utils.generateTransactionId();
  const paymentPayload = {
    transactionId: testTxn,
    studentId: regRes.data.studentId,
    studentName: "Aman Sharma",
    studentEmail: regEmail,
    studentPhone: "9876543210",
    courseId: aiCourse.courseId,
    utrNumber: "492019482910",
    paymentProof: "data:image/png;base64,mock_screenshot_data"
  };

  const paymentRes = await API.recordPayment(paymentPayload);
  assert(paymentRes.success === true, "Payment submitted successfully");
  assert(paymentRes.data.paymentStatus === "PENDING", "Payment is recorded with PENDING status");
  assert(paymentRes.data.amount === 499, "Server-side price verification correctly enforced ₹499");

  // Duplicate Transaction ID prevention test
  const dupTxnRes = await API.recordPayment(paymentPayload);
  assert(dupTxnRes.success === false, "Duplicate transaction submission is blocked");

  // Duplicate UTR prevention test
  const dupUtrPayload = {
    ...paymentPayload,
    transactionId: Utils.generateTransactionId() // different txn id, same UTR
  };
  const dupUtrRes = await API.recordPayment(dupUtrPayload);
  assert(dupUtrRes.success === false, "Duplicate UTR code submission is blocked");

  // 6. Student Dashboard Status BEFORE Admin Verification
  const enrollmentsBeforeVerify = await API.getStudentEnrollments(regRes.data.studentId);
  assert(enrollmentsBeforeVerify.success === true, "Student enrollments retrieved");
  const pendingEnrollment = enrollmentsBeforeVerify.data.find(e => e.transactionId === testTxn);
  assert(!!pendingEnrollment, "Student dashboard sees submitted pending enrollment");
  assert(pendingEnrollment.status === "PENDING_APPROVAL", "Enrollment status is PENDING_APPROVAL prior to verification");

  // 7. Admin Authentication
  const adminLoginRes = await API.adminLogin("admin@ornevalabs.com", "orneva2026!");
  assert(adminLoginRes.success === true, "Admin authenticated with default credentials");
  const adminToken = adminLoginRes.data.token;

  // 8. Admin Payment Verification Workflow
  const verifyRes = await API.updatePaymentStatus(testTxn, "VERIFIED", "Approved by lead admin", adminToken);
  assert(verifyRes.success === true, "Admin payment verification action succeeded");
  assert(verifyRes.data.paymentStatus === "VERIFIED", "Payment status updated to VERIFIED");
  assert(verifyRes.data.enrollmentStatus === "CONFIRMED", "Enrollment status updated to CONFIRMED");

  // 9. Student Dashboard Status AFTER Admin Verification
  const enrollmentsAfterVerify = await API.getStudentEnrollments(regRes.data.studentId);
  const activeEnrollment = enrollmentsAfterVerify.data.find(e => e.transactionId === testTxn);
  assert(!!activeEnrollment, "Enrolled course exists in student dashboard");
  assert(activeEnrollment.status === "ACTIVE", "Enrollment status changed to ACTIVE, unlocking course access");

  // 10. Student Progress Tracking
  const prgUpdate1 = await API.updateProgress(regRes.data.studentId, aiCourse.courseId, "mod_1", true);
  assert(prgUpdate1.success === true, "Module 1 marked as completed");

  const prgUpdate2 = await API.updateProgress(regRes.data.studentId, aiCourse.courseId, "mod_2", true);
  assert(prgUpdate2.success === true, "Module 2 marked as completed");

  const enrollmentsWithPrg = await API.getStudentEnrollments(regRes.data.studentId);
  const updatedEnr = enrollmentsWithPrg.data.find(e => e.transactionId === testTxn);
  assert(updatedEnr.progress.completedModules === 2, "Completed modules count is 2");
  assert(updatedEnr.progress.percentage === 50, "Course progress calculated correctly as 50% (2 of 4 modules)");

  // 11. Admin Statistics Calculation: Revenue ONLY from Verified Payments
  const statsRes = await API.getAdminStats(adminToken);
  assert(statsRes.success === true, "Admin stats retrieved");
  assert(statsRes.data.totalCourses === 5, "Admin stats shows 5 total courses");
  assert(statsRes.data.verifiedPayments >= 2, "Verified payments count updated");
  assert(statsRes.data.totalRevenue > 0, "Total revenue calculated from verified payments");

  // 12. Admin Course Management (CRUD)
  const newCoursePayload = {
    title: "No-Code AI Automation",
    slug: `no-code-ai-${Date.now()}`,
    subtitle: "Automate everything with Make and AI",
    description: "Build business automations without writing code.",
    category: "AI",
    difficulty: "Beginner",
    duration: "2.5 Hours",
    price: 349,
    thumbnail: "assets/courses/course-ai-app.jpg",
    project: "Build an automated lead qualification bot",
    tools: ["Make.com", "OpenAI"],
    learningOutcomes: ["Connect Webhooks", "Trigger AI actions"],
    prerequisites: ["Curiosity"],
    published: true
  };

  const createCourseRes = await API.createCourse(newCoursePayload, adminToken);
  assert(createCourseRes.success === true, "Admin created a new course successfully");

  const editCourseRes = await API.updateCourse(createCourseRes.data.courseId, { price: 399 }, adminToken);
  assert(editCourseRes.success === true && editCourseRes.data.price === 399, "Admin updated course price to ₹399");

  const deleteCourseRes = await API.deleteCourse(createCourseRes.data.courseId, adminToken);
  assert(deleteCourseRes.success === true, "Admin deleted course successfully");

  // 13. System Audit Logs
  const logsRes = await API.getLogs(adminToken);
  assert(logsRes.success === true, "Audit logs retrieved");
  assert(logsRes.data.length >= 5, "Audit logs contain all recorded actions (creation, verification, logins)");

  // --- TEST GROUP 3: ADMINISTRATIVE SECURITY PERIMETER & AUTHORIZATION ---
  console.log(`\n${colors.yellow}[3. Administrative Security Perimeter & Auth Tests]${colors.reset}`);

  const unauthCreate = await API.createCourse({ title: "Hack Course", slug: "hack-course", price: 100 }, "invalid_token");
  assert(unauthCreate.success === false, "Unauthorized course creation is blocked");

  const unauthEdit = await API.updateCourse(aiCourse.courseId, { price: 10 }, null);
  assert(unauthEdit.success === false, "Unauthorized course modification without token is blocked");

  const unauthDelete = await API.deleteCourse(aiCourse.courseId, "adm_tok_fake");
  assert(unauthDelete.success === false, "Unauthorized course deletion with fake token is blocked");

  const unauthStudents = await API.getStudents("not_a_token");
  assert(unauthStudents.success === false, "Unauthorized access to student database is blocked");

  const unauthEnrollments = await API.getEnrollments(null);
  assert(unauthEnrollments.success === false, "Unauthorized access to enrollments is blocked");

  const unauthPaymentVerify = await API.updatePaymentStatus(testTxn, "VERIFIED", "Hacked", "fake_token");
  assert(unauthPaymentVerify.success === false, "Unauthorized payment verification with fake token is blocked");

  const unauthSettings = await API.updateSettings({ upiId: "hacked@upi" }, null);
  assert(unauthSettings.success === false, "Unauthorized system settings modification is blocked");

  const unauthLogs = await API.getLogs(undefined);
  assert(unauthLogs.success === false, "Unauthorized audit logs access is blocked");

  const verifyValidSession = await API.verifyAdminSession(adminToken);
  assert(verifyValidSession.success === true && verifyValidSession.valid === true, "Valid admin session token passes verification");

  const verifyInvalidSession = await API.verifyAdminSession("invalid_token_xyz");
  assert(verifyInvalidSession.success === false, "Invalid admin session token is rejected");

  // --- TEST GROUP 4: FIREBASE IDENTITY & PROFILE SYNCHRONIZATION ---
  console.log(`\n${colors.yellow}[4. Firebase Identity & Profile Synchronization]${colors.reset}`);

  // Evaluate firebase-config.js
  const fbConfigCode = fs.readFileSync('js/firebase-config.js', 'utf8');
  eval(`(function(window) { ${fbConfigCode} })(sandbox.window)`);
  assert(!!sandbox.window.OrnevaFirebaseConfig, "Firebase Config module loaded");
  assert(typeof sandbox.window.OrnevaFirebaseConfig.isFirebaseConfigured === 'function', "Firebase config check helper exists");

  // Evaluate firebase-auth.js
  const fbAuthCode = fs.readFileSync('js/firebase-auth.js', 'utf8');
  eval(`(function(window, document, localStorage) { ${fbAuthCode} })(sandbox.window, sandbox.document, sandbox.localStorage)`);
  const FirebaseAuth = sandbox.window.OrnevaFirebaseAuth;
  assert(!!FirebaseAuth, "Firebase Auth Service loaded");
  assert(typeof FirebaseAuth.signInWithGoogle === 'function', "Google OAuth method available");
  assert(typeof FirebaseAuth.loginWithEmail === 'function', "Email login method available");
  assert(typeof FirebaseAuth.registerWithEmail === 'function', "Email registration method available");
  assert(typeof FirebaseAuth.sendPasswordReset === 'function', "Password reset method available");
  assert(typeof FirebaseAuth.logout === 'function', "Logout method available");

  // Profile sync with Firebase UID
  const firebaseStudentData = {
    firebaseUid: "firebase_usr_test_99",
    name: "Rohan Patel",
    email: "rohan.patel@example.com",
    photoURL: "https://example.com/avatar.jpg"
  };

  const syncRes1 = await API.syncStudentProfile(firebaseStudentData);
  assert(syncRes1.success === true, "Student profile synchronized with Firebase identity");
  assert(syncRes1.data.firebaseUid === "firebase_usr_test_99", "Synchronized record contains Firebase UID");
  assert(syncRes1.data.email === "rohan.patel@example.com", "Synchronized record retains email");

  // Re-sync with same UID - should not duplicate student
  const syncRes2 = await API.syncStudentProfile({
    ...firebaseStudentData,
    name: "Rohan Patel (Updated)"
  });
  assert(syncRes2.success === true, "Re-syncing existing Firebase user succeeds");
  assert(syncRes2.data.studentId === syncRes1.data.studentId, "Duplicate student record prevented on re-authentication");
  assert(syncRes2.data.name === "Rohan Patel (Updated)", "Student profile updated with latest credentials");

  // --- SUMMARY ---
  console.log(`\n${colors.cyan}====================================================`);
  console.log(`  QA TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log(`  ${colors.green}ALL INTEGRATION TESTS PASSED 100% CLEANLY!${colors.reset}`);
  } else {
    console.log(`  ${colors.red}${totalTests - passedTests} TESTS FAILED${colors.reset}`);
  }
  console.log(`====================================================${colors.reset}\n`);
}

runTestSuite().catch(err => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
