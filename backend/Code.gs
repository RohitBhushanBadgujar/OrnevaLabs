/**
 * ORNEVA LABS - Google Apps Script Production Backend API
 * "The Origin of New Possibilities"
 * 
 * Instructions:
 * 1. Open Google Sheets and create a new Spreadsheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Paste this entire Code.gs file.
 * 4. Run `setupOrnevaDatabase()` once to initialize tables, headers, and seed courses.
 * 5. Click Deploy -> New Deployment -> Select type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web app URL and paste into CONFIG.API_URL in `js/utils.js`.
 */

// Global Sheet Schema Names
var SHEETS = {
  COURSES: "Courses",
  STUDENTS: "Students",
  PAYMENTS: "Payments",
  ENROLLMENTS: "Enrollments",
  PROGRESS: "Progress",
  LOGS: "Logs",
  SETTINGS: "Settings",
  ADMINS: "Admins"
};

/**
 * DATABASE INITIALIZATION & SCHEMA SETUP
 * Safely creates sheets, headers, and seeds initial courses without duplicating.
 */
function setupOrnevaDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var schemas = [
    {
      name: SHEETS.COURSES,
      headers: [
        "courseId", "slug", "title", "subtitle", "description", "category",
        "difficulty", "duration", "price", "thumbnail", "learningOutcomes",
        "prerequisites", "curriculum", "tools", "project", "published", "createdAt", "updatedAt"
      ]
    },
    {
      name: SHEETS.STUDENTS,
      headers: ["studentId", "name", "email", "phone", "passwordHash", "createdAt"]
    },
    {
      name: SHEETS.PAYMENTS,
      headers: [
        "transactionId", "timestamp", "studentId", "studentName", "studentEmail", "studentPhone",
        "courseId", "courseTitle", "amount", "paymentMethod", "utrNumber", "paymentStatus",
        "proofStatus", "paymentProof", "enrollmentStatus", "notes"
      ]
    },
    {
      name: SHEETS.ENROLLMENTS,
      headers: ["enrollmentId", "studentId", "courseId", "transactionId", "status", "enrolledAt"]
    },
    {
      name: SHEETS.PROGRESS,
      headers: ["progressId", "studentId", "courseId", "moduleId", "completed", "updatedAt"]
    },
    {
      name: SHEETS.LOGS,
      headers: ["timestamp", "action", "user", "details"]
    },
    {
      name: SHEETS.SETTINGS,
      headers: ["key", "value"]
    },
    {
      name: SHEETS.ADMINS,
      headers: ["adminId", "email", "role", "passwordHash", "status", "createdAt"]
    }
  ];

  schemas.forEach(function (schema) {
    var sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
    }
    // Check if headers exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema.headers);
      sheet.getRange(1, 1, 1, schema.headers.length).setFontWeight("bold").setBackground("#1a1e28").setFontColor("#ff5722");
      sheet.setFrozenRows(1);
    }
  });

  // Seed default settings if empty
  var settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(["upiId", "9172750062@fam"]);
    settingsSheet.appendRow(["payeeName", "Orneva Labs"]);
    settingsSheet.appendRow(["whatsappNumber", "9172750062"]);
    settingsSheet.appendRow(["announcement", "Welcome to Orneva Labs! Learn something useful. Build something real."]);
  }

  // Seed default admin if empty
  var adminSheet = ss.getSheetByName(SHEETS.ADMINS);
  if (adminSheet.getLastRow() <= 1) {
    var scriptProps = PropertiesService.getScriptProperties();
    var initialPass = scriptProps.getProperty("INITIAL_ADMIN_PASSWORD");
    if (!initialPass) {
      initialPass = Utilities.getUuid().substring(0, 16) + "!A1";
      scriptProps.setProperty("INITIAL_ADMIN_PASSWORD", initialPass);
      Logger.log("[SECURITY] Initial admin password securely generated in Script Properties.");
    }
    adminSheet.appendRow([
      "adm_001",
      "admin@ornevalabs.com",
      "SUPER_ADMIN",
      hashString(initialPass),
      "ACTIVE",
      new Date().toISOString()
    ]);
  }

  // Seed Initial 5 Courses if not present
  seedInitialCourses(ss);

  writeSystemLog("SYSTEM_SETUP", "system", "Orneva Labs database initialized successfully.");
  Logger.log("Orneva Labs Database Setup Completed Successfully!");
}

/**
 * Seed Initial Courses safely
 */
function seedInitialCourses(ss) {
  var sheet = ss.getSheetByName(SHEETS.COURSES);
  if (sheet.getLastRow() > 1) {
    Logger.log("Courses already exist. Skipping duplicate seed.");
    return;
  }

  var seedCourses = [
    {
      courseId: "crs_001",
      slug: "build-your-first-ai-app",
      title: "Build Your First AI App",
      subtitle: "From prompt idea to live full-stack AI web app in 3.5 hours",
      description: "Master modern AI application development without getting lost in theoretical math. Connect cutting-edge LLMs, build an interactive web interface, and deploy a live AI tool solving student problems.",
      category: "AI",
      difficulty: "Beginner",
      duration: "3.5 Hours",
      price: 499,
      thumbnail: "assets/courses/course-ai-app.jpg",
      learningOutcomes: JSON.stringify([
        "Architect and connect OpenAI / Gemini API endpoints securely",
        "Build prompt engineering templates with structured JSON outputs",
        "Implement real-time streaming AI responses in clean web interfaces",
        "Deploy your live AI web application with custom domain and hosting"
      ]),
      prerequisites: JSON.stringify(["Basic computer literacy", "Curiosity to build"]),
      curriculum: JSON.stringify([
        { id: "mod_1", title: "Phase 1: Demystifying Modern AI APIs & Architecture", duration: "45 mins", topics: ["API Tokens", "Security", "First Request"] },
        { id: "mod_2", title: "Phase 2: Building the Responsive Front-End Interface", duration: "55 mins", topics: ["Glassmorphic Chat", "State Management", "Streaming"] },
        { id: "mod_3", title: "Phase 3: Structured Outputs & Function Calling", duration: "50 mins", topics: ["JSON Outputs", "Document Analysis", "Error Handling"] },
        { id: "mod_4", title: "Phase 4: Launching & Proving Your Project", duration: "60 mins", topics: ["Live Deployment", "Portfolio Link", "Monetization"] }
      ]),
      tools: JSON.stringify(["Gemini API", "JavaScript", "HTML/CSS", "Vercel"]),
      project: "Deploy an interactive AI Academic Research Assistant with live streaming.",
      published: true
    },
    {
      courseId: "crs_002",
      slug: "chatgpt-mastery-for-students",
      title: "ChatGPT Mastery for Students",
      subtitle: "Turn conversational AI into your unfair 10x academic & research advantage",
      description: "Learn advanced prompt engineering frameworks, academic research workflows, exam preparation systems, coding assistance, and portfolio drafting saving 15+ hours weekly.",
      category: "AI",
      difficulty: "Beginner",
      duration: "2.0 Hours",
      price: 299,
      thumbnail: "assets/courses/course-chatgpt.jpg",
      learningOutcomes: JSON.stringify(["CREATE and RICE prompt frameworks", "Synthesize 50-page papers", "Draft winning resumes"]),
      prerequisites: JSON.stringify(["Free ChatGPT account"]),
      curriculum: JSON.stringify([
        { id: "mod_1", title: "Phase 1: The Prompt Architect Mindset", duration: "30 mins", topics: ["High leverage prompts", "Avoiding hallucinations"] },
        { id: "mod_2", title: "Phase 2: Academic Deep Work", duration: "35 mins", topics: ["Feynman technique", "Paper review"] }
      ]),
      tools: JSON.stringify(["ChatGPT", "Claude", "Perplexity", "Notion"]),
      project: "Build a personal Academic Copilot with 12 reusable production prompt templates.",
      published: true
    },
    {
      courseId: "crs_003",
      slug: "canva-to-creator",
      title: "Canva to Creator",
      subtitle: "Design high-converting brand identities, pitch decks, and digital products",
      description: "Master Canva's advanced professional toolset: grid systems, color theory, typography hierarchy, mockups, and pitch deck storytelling to become a recognized digital creator.",
      category: "Design",
      difficulty: "Beginner",
      duration: "2.5 Hours",
      price: 349,
      thumbnail: "assets/courses/course-canva.jpg",
      learningOutcomes: JSON.stringify(["Typography pairing", "Pitch deck design", "Creator social kits"]),
      prerequisites: JSON.stringify(["Free Canva account"]),
      curriculum: JSON.stringify([
        { id: "mod_1", title: "Phase 1: Visual Design Fundamentals", duration: "35 mins", topics: ["Hierarchy", "Typography", "Color harmony"] }
      ]),
      tools: JSON.stringify(["Canva", "Coolors", "Unsplash"]),
      project: "Build and publish a complete 10-slide startup pitch deck and matching brand identity kit.",
      published: true
    },
    {
      courseId: "crs_004",
      slug: "ai-productivity-system",
      title: "AI Productivity System",
      subtitle: "Construct an automated Second Brain in Notion supercharged by AI agents",
      description: "Build an automated Notion Second Brain using the PARA methodology, automated weekly planners, task managers, and AI knowledge retrieval agents.",
      category: "Productivity",
      difficulty: "Intermediate",
      duration: "3.0 Hours",
      price: 399,
      thumbnail: "assets/courses/course-productivity.jpg",
      learningOutcomes: JSON.stringify(["PARA framework", "Automated sprints", "AI summarizers"]),
      prerequisites: JSON.stringify(["Free Notion account"]),
      curriculum: JSON.stringify([
        { id: "mod_1", title: "Phase 1: Second Brain Architecture", duration: "45 mins", topics: ["PARA Method", "Relational databases"] }
      ]),
      tools: JSON.stringify(["Notion", "Make.com", "Notion AI"]),
      project: "Build an operational Notion Second Brain workspace with daily automated briefing.",
      published: true
    },
    {
      courseId: "crs_005",
      slug: "build-your-first-startup-mvp",
      title: "Build Your First Startup MVP",
      subtitle: "Validate an idea, create a working prototype, and launch in 1 weekend",
      description: "From problem discovery and rapid low-code development to payment setup and first-customer outreach, take an idea from zero to a live, testable Minimum Viable Product.",
      category: "Startup",
      difficulty: "Intermediate",
      duration: "5.0 Hours",
      price: 699,
      thumbnail: "assets/courses/course-startup.jpg",
      learningOutcomes: JSON.stringify(["Problem validation", "Wireframing & rapid build", "Payment setup", "7-day grassroots launch"]),
      prerequisites: JSON.stringify(["An idea or curiosity"]),
      curriculum: JSON.stringify([
        { id: "mod_1", title: "Phase 1: Idea Validation & Interviews", duration: "60 mins", topics: ["Mom Test", "Pain point interviews"] }
      ]),
      tools: JSON.stringify(["Figma", "HTML/JS", "UPI", "Google Sheets"]),
      project: "Launch a live, functional MVP landing page with payment collection and live user tracking.",
      published: true
    }
  ];

  var now = new Date().toISOString();
  seedCourses.forEach(function (c) {
    sheet.appendRow([
      c.courseId, c.slug, c.title, c.subtitle, c.description, c.category,
      c.difficulty, c.duration, c.price, c.thumbnail, c.learningOutcomes,
      c.prerequisites, c.curriculum, c.tools, c.project, c.published, now, now
    ]);
  });
}

/**
 * REST HTTP DISPATCHERS: doGet & doPost
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getCourses";
  var result = handleApiRequest(action, e.parameter || {});
  return createJsonResponse(result);
}

function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: "Malformed JSON payload" });
  }

  var action = data.action || (e && e.parameter && e.parameter.action) || "unknown";
  var result = handleApiRequest(action, data);
  return createJsonResponse(result);
}

/**
 * Main API Route Handler
 */
    // Enforce server-side authorization for all admin-only actions
    var adminActions = [
      "createCourse", "updateCourse", "deleteCourse",
      "getPayments", "updatePaymentStatus", "getAdminStats",
      "updateSettings", "getLogs", "getStudents", "getEnrollments"
    ];

    if (adminActions.indexOf(action) !== -1) {
      if (!validateAdminAuthorization(payload.adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
    }

    switch (action) {
      case "getCourses":
        return apiGetCourses(payload.filters || {});

      case "getCourseBySlug":
        return apiGetCourseBySlug(payload.slug);

      case "createCourse":
        return apiCreateCourse(payload.courseData, payload.adminToken);

      case "updateCourse":
        return apiUpdateCourse(payload.courseId, payload.courseData, payload.adminToken);

      case "deleteCourse":
        return apiDeleteCourse(payload.courseId, payload.adminToken);

      case "studentRegister":
        return apiStudentRegister(payload);

      case "studentLogin":
        return apiStudentLogin(payload);

      case "syncStudentProfile":
        return apiSyncStudentProfile(payload.studentData || payload);

      case "getStudentEnrollments":
        return apiGetStudentEnrollments(payload.studentId, payload.email);

      case "recordPayment":
        return apiRecordPayment(payload.paymentData || payload);

      case "getPayments":
        return apiGetPayments(payload.adminToken, payload.filters || {});

      case "getPaymentByTransaction":
        return apiGetPaymentByTransaction(payload.transactionId);

      case "updatePaymentStatus":
        return apiUpdatePaymentStatus(payload.transactionId, payload.status, payload.notes, payload.adminToken);

      case "getProgress":
        return apiGetProgress(payload.studentId, payload.courseId);

      case "updateProgress":
        return apiUpdateProgress(payload.studentId, payload.courseId, payload.moduleId, payload.completed);

      case "getAdminStats":
        return apiGetAdminStats(payload.adminToken);

      case "adminLogin":
        return apiAdminLogin(payload.email, payload.password);

      case "verifyAdminToken":
        return { success: validateAdminAuthorization(payload.adminToken) };

      case "getSettings":
        return apiGetSettings();

      case "updateSettings":
        return apiUpdateSettings(payload.settings, payload.adminToken);

      case "getLogs":
        return apiGetLogs(payload.adminToken);

      default:
        return { success: false, error: "Action '" + action + "' not recognized." };
    }
  } catch (err) {
    Logger.log("API Error: " + err.toString());
    return { success: false, error: "Server processing error: " + err.message };
  }
}

// =========================================================================
// API ENDPOINT IMPLEMENTATIONS
// =========================================================================

function apiGetCourses(filters) {
  var rows = getSheetData(SHEETS.COURSES);
  var list = rows.map(formatCourseRow);

  if (!filters.includeUnpublished) {
    list = list.filter(function (c) { return c.published !== false; });
  }
  if (filters.category && filters.category !== "All") {
    list = list.filter(function (c) { return String(c.category).toLowerCase() === String(filters.category).toLowerCase(); });
  }
  if (filters.difficulty && filters.difficulty !== "All") {
    list = list.filter(function (c) { return String(c.difficulty).toLowerCase() === String(filters.difficulty).toLowerCase(); });
  }
  return { success: true, data: list };
}

function apiGetCourseBySlug(slug) {
  if (!slug) return { success: false, error: "Slug required." };
  var rows = getSheetData(SHEETS.COURSES);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].slug === slug.trim()) {
      return { success: true, data: formatCourseRow(rows[i]) };
    }
  }
  return { success: false, error: "Course not found." };
}

function apiRecordPayment(paymentData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pSheet = ss.getSheetByName(SHEETS.PAYMENTS);
  var cSheet = ss.getSheetByName(SHEETS.COURSES);

  if (!paymentData.transactionId || !paymentData.courseId || !paymentData.studentEmail) {
    return { success: false, error: "Missing required fields." };
  }

  // Duplicate Check
  var payments = getSheetData(SHEETS.PAYMENTS);
  for (var i = 0; i < payments.length; i++) {
    if (payments[i].transactionId === paymentData.transactionId.trim()) {
      return { success: false, error: "Duplicate transaction ID detected." };
    }
  }

  // Server-Side Price Verification (NEVER trust frontend price)
  var courses = getSheetData(SHEETS.COURSES);
  var targetCourse = null;
  for (var j = 0; j < courses.length; j++) {
    if (courses[j].courseId === paymentData.courseId) {
      targetCourse = courses[j];
      break;
    }
  }

  if (!targetCourse) {
    return { success: false, error: "Course not found in database." };
  }

  var verifiedAmount = Number(targetCourse.price);
  var now = new Date().toISOString();

  pSheet.appendRow([
    paymentData.transactionId.trim(),
    now,
    paymentData.studentId || ("std_" + Date.now()),
    paymentData.studentName || "Student",
    paymentData.studentEmail.trim().toLowerCase(),
    paymentData.studentPhone || "",
    paymentData.courseId,
    targetCourse.title,
    verifiedAmount,
    "UPI (9172750062@fam)",
    paymentData.utrNumber || "",
    "PENDING",
    paymentData.paymentProof ? "SUBMITTED" : "NOT_PROVIDED",
    paymentData.paymentProof || "",
    "PENDING",
    "Submitted via Web Checkout"
  ]);

  writeSystemLog("PAYMENT_SUBMITTED", paymentData.studentEmail, "Payment " + paymentData.transactionId + " pending verification for ₹" + verifiedAmount);
  return { success: true, message: "Payment registered as PENDING. Awaiting admin review." };
}

function apiUpdatePaymentStatus(transactionId, status, notes, adminToken) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PAYMENTS);
  var data = sheet.getDataRange().getValues();

  var cleanStatus = String(status).toUpperCase();
  var found = false;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === transactionId) {
      found = true;
      var row = i + 1;
      sheet.getRange(row, 12).setValue(cleanStatus); // paymentStatus
      sheet.getRange(row, 16).setValue(notes || "");

      var studentId = data[i][2];
      var courseId = data[i][6];

      if (cleanStatus === "VERIFIED") {
        sheet.getRange(row, 13).setValue("VERIFIED"); // proofStatus
        sheet.getRange(row, 15).setValue("CONFIRMED"); // enrollmentStatus

        // Create or activate enrollment
        activateEnrollment(studentId, courseId, transactionId);
        writeSystemLog("PAYMENT_VERIFIED", adminToken || "admin", "Verified payment " + transactionId + " and activated enrollment.");
      } else if (cleanStatus === "REJECTED") {
        sheet.getRange(row, 13).setValue("REJECTED");
        sheet.getRange(row, 15).setValue("REJECTED");
        writeSystemLog("PAYMENT_REJECTED", adminToken || "admin", "Rejected payment " + transactionId + " Reason: " + notes);
      }
      break;
    }
  }

  if (!found) return { success: false, error: "Payment not found." };
  return { success: true, message: "Status updated to " + cleanStatus };
}

function activateEnrollment(studentId, courseId, transactionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.ENROLLMENTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === transactionId) {
      sheet.getRange(i + 1, 5).setValue("ACTIVE");
      return;
    }
  }

  sheet.appendRow([
    "enr_" + Date.now(),
    studentId,
    courseId,
    transactionId,
    "ACTIVE",
    new Date().toISOString()
  ]);
}

function apiGetAdminStats(adminToken) {
  var courses = getSheetData(SHEETS.COURSES);
  var students = getSheetData(SHEETS.STUDENTS);
  var payments = getSheetData(SHEETS.PAYMENTS);
  var enrollments = getSheetData(SHEETS.ENROLLMENTS);

  var pending = payments.filter(function (p) { return p.paymentStatus === "PENDING"; }).length;
  var verified = payments.filter(function (p) { return p.paymentStatus === "VERIFIED"; }).length;
  var rejected = payments.filter(function (p) { return p.paymentStatus === "REJECTED"; }).length;

  // REVENUE ONLY FROM VERIFIED PAYMENTS
  var totalRevenue = payments
    .filter(function (p) { return p.paymentStatus === "VERIFIED"; })
    .reduce(function (sum, p) { return sum + (Number(p.amount) || 0); }, 0);

  var activeEnrollments = enrollments.filter(function (e) { return e.status === "ACTIVE"; }).length;

  return {
    success: true,
    data: {
      totalCourses: courses.length,
      publishedCourses: courses.filter(function (c) { return c.published !== false; }).length,
      totalStudents: students.length,
      totalPayments: payments.length,
      pendingPayments: pending,
      verifiedPayments: verified,
      rejectedPayments: rejected,
      totalRevenue: totalRevenue,
      activeEnrollments: activeEnrollments
    }
  };
}

function apiCreateCourse(courseData, adminToken) {
  if (!courseData || !courseData.title || !courseData.slug || !courseData.price) {
    return { success: false, error: "Title, slug, and price are required." };
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.COURSES);
  var courses = getSheetData(SHEETS.COURSES);

  var cleanSlug = String(courseData.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  for (var i = 0; i < courses.length; i++) {
    if (courses[i].slug === cleanSlug) {
      return { success: false, error: "A course with this slug already exists." };
    }
  }

  var courseId = courseData.courseId || ("crs_" + Date.now());
  var now = new Date().toISOString();

  sheet.appendRow([
    courseId,
    cleanSlug,
    courseData.title.trim(),
    courseData.subtitle || "",
    courseData.description || "",
    courseData.category || "AI",
    courseData.difficulty || "Beginner",
    courseData.duration || "2.0 Hours",
    Number(courseData.price) || 299,
    courseData.thumbnail || "assets/courses/course-ai-app.jpg",
    JSON.stringify(Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : []),
    JSON.stringify(Array.isArray(courseData.prerequisites) ? courseData.prerequisites : []),
    JSON.stringify(Array.isArray(courseData.curriculum) ? courseData.curriculum : []),
    JSON.stringify(Array.isArray(courseData.tools) ? courseData.tools : []),
    courseData.project || "",
    courseData.published !== false,
    now,
    now
  ]);

  writeSystemLog("COURSE_CREATE", adminToken || "admin", "Created course: " + courseData.title);
  return { success: true, data: { courseId: courseId, slug: cleanSlug, title: courseData.title } };
}

function apiUpdateCourse(courseId, courseData, adminToken) {
  if (!courseId) return { success: false, error: "Course ID required." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.COURSES);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, error: "No courses found." };

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      rowIndex = i + 1;
      break;
    }
  }
  if (rowIndex === -1) return { success: false, error: "Course not found." };

  var fields = {
    title: 3, subtitle: 4, description: 5, category: 6, difficulty: 7,
    duration: 8, price: 9, thumbnail: 10, project: 15, published: 16
  };

  for (var key in fields) {
    if (courseData[key] !== undefined) {
      sheet.getRange(rowIndex, fields[key]).setValue(courseData[key]);
    }
  }
  if (courseData.learningOutcomes !== undefined) {
    sheet.getRange(rowIndex, 11).setValue(JSON.stringify(courseData.learningOutcomes));
  }
  if (courseData.prerequisites !== undefined) {
    sheet.getRange(rowIndex, 12).setValue(JSON.stringify(courseData.prerequisites));
  }
  if (courseData.curriculum !== undefined) {
    sheet.getRange(rowIndex, 13).setValue(JSON.stringify(courseData.curriculum));
  }
  if (courseData.tools !== undefined) {
    sheet.getRange(rowIndex, 14).setValue(JSON.stringify(courseData.tools));
  }
  sheet.getRange(rowIndex, 18).setValue(new Date().toISOString());

  writeSystemLog("COURSE_UPDATE", adminToken || "admin", "Updated course: " + courseId);
  return { success: true, message: "Course updated successfully." };
}

function apiDeleteCourse(courseId, adminToken) {
  if (!courseId) return { success: false, error: "Course ID required." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.COURSES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      sheet.deleteRow(i + 1);
      writeSystemLog("COURSE_DELETE", adminToken || "admin", "Deleted course: " + courseId);
      return { success: true, message: "Course deleted successfully." };
    }
  }
  return { success: false, error: "Course not found." };
}

function apiStudentRegister(payload) {
  if (!payload.name || !payload.email || !payload.passwordHash) {
    return { success: false, error: "Name, email, and password are required." };
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.STUDENTS);
  var cleanEmail = String(payload.email).trim().toLowerCase();

  var students = getSheetData(SHEETS.STUDENTS);
  for (var i = 0; i < students.length; i++) {
    if (String(students[i].email).trim().toLowerCase() === cleanEmail) {
      return { success: false, error: "An account with this email already exists." };
    }
  }

  var studentId = "std_" + Date.now();
  sheet.appendRow([
    studentId,
    payload.name.trim(),
    cleanEmail,
    payload.phone || "",
    payload.passwordHash,
    new Date().toISOString()
  ]);

  writeSystemLog("STUDENT_REGISTER", cleanEmail, "Student registered: " + payload.name);
  return {
    success: true,
    data: {
      studentId: studentId,
      name: payload.name.trim(),
      email: cleanEmail,
      phone: payload.phone || "",
      token: "stk_" + Date.now() + "_" + Math.random().toString(36).substring(2)
    }
  };
}

function apiStudentLogin(payload) {
  if (!payload.email || !payload.passwordHash) {
    return { success: false, error: "Email and password are required." };
  }
  var cleanEmail = String(payload.email).trim().toLowerCase();
  var students = getSheetData(SHEETS.STUDENTS);

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].email).trim().toLowerCase() === cleanEmail) {
      if (students[i].passwordHash === payload.passwordHash) {
        writeSystemLog("STUDENT_LOGIN", cleanEmail, "Student logged in successfully");
        return {
          success: true,
          data: {
            studentId: students[i].studentId,
            name: students[i].name,
            email: students[i].email,
            phone: students[i].phone,
            token: "stk_" + Date.now() + "_" + Math.random().toString(36).substring(2)
          }
        };
      } else {
        return { success: false, error: "Invalid password." };
      }
    }
  }
  return { success: false, error: "Account not found." };
}

function apiGetStudentEnrollments(studentId) {
  if (!studentId) return { success: false, error: "Student ID required." };
  var enrollments = getSheetData(SHEETS.ENROLLMENTS).filter(function (e) { return e.studentId === studentId; });
  var payments = getSheetData(SHEETS.PAYMENTS).filter(function (p) { return p.studentId === studentId; });
  var courses = getSheetData(SHEETS.COURSES).map(formatCourseRow);
  var progress = getSheetData(SHEETS.PROGRESS).filter(function (prg) { return prg.studentId === studentId; });

  var result = enrollments.map(function (enr) {
    var course = courses.find(function (c) { return c.courseId === enr.courseId; }) || {};
    var payment = payments.find(function (p) { return p.transactionId === enr.transactionId; }) || {};
    var cProgress = progress.filter(function (p) { return p.courseId === enr.courseId; });
    var totalMods = course.curriculum ? course.curriculum.length : 0;
    var completedMods = cProgress.filter(function (p) { return p.completed === true || p.completed === "true"; }).length;

    return Object.assign({}, enr, {
      course: course,
      payment: payment,
      progress: {
        completedModules: completedMods,
        totalModules: totalMods,
        percentage: totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : 0,
        items: cProgress
      }
    });
  });

  payments.filter(function (p) {
    return p.paymentStatus === "PENDING" && !enrollments.some(function (e) { return e.transactionId === p.transactionId; });
  }).forEach(function (p) {
    var course = courses.find(function (c) { return c.courseId === p.courseId; }) || {};
    result.push({
      enrollmentId: "pending_" + p.transactionId,
      studentId: studentId,
      courseId: p.courseId,
      transactionId: p.transactionId,
      status: "PENDING_APPROVAL",
      enrolledAt: p.timestamp,
      course: course,
      payment: p,
      progress: { completedModules: 0, totalModules: (course.curriculum || []).length, percentage: 0, items: [] }
    });
  });

  return { success: true, data: result };
}

function apiGetPayments(adminToken, filters) {
  var payments = getSheetData(SHEETS.PAYMENTS);
  if (filters && filters.status && filters.status !== "All") {
    payments = payments.filter(function (p) { return String(p.paymentStatus).toUpperCase() === String(filters.status).toUpperCase(); });
  }
  return { success: true, data: payments };
}

function apiGetPaymentByTransaction(transactionId) {
  if (!transactionId) return { success: false, error: "Transaction ID required." };
  var payments = getSheetData(SHEETS.PAYMENTS);
  for (var i = 0; i < payments.length; i++) {
    if (payments[i].transactionId === transactionId.trim()) {
      return { success: true, data: payments[i] };
    }
  }
  return { success: false, error: "Transaction not found." };
}

function apiGetProgress(studentId, courseId) {
  var progress = getSheetData(SHEETS.PROGRESS);
  var filtered = progress.filter(function (p) {
    return p.studentId === studentId && p.courseId === courseId;
  });
  return { success: true, data: filtered };
}

function apiUpdateProgress(studentId, courseId, moduleId, completed) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PROGRESS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === studentId && data[i][2] === courseId && data[i][3] === moduleId) {
      sheet.getRange(i + 1, 5).setValue(completed);
      sheet.getRange(i + 1, 6).setValue(new Date().toISOString());
      return { success: true, data: { moduleId: moduleId, completed: completed } };
    }
  }

  sheet.appendRow([
    "prg_" + Date.now(),
    studentId,
    courseId,
    moduleId,
    completed,
    new Date().toISOString()
  ]);
  return { success: true, data: { moduleId: moduleId, completed: completed } };
}

function validateAdminAuthorization(adminToken) {
  if (!adminToken || typeof adminToken !== "string" || !adminToken.startsWith("adm_tok_")) {
    return false;
  }
  try {
    var cache = CacheService.getScriptCache();
    var cached = cache.get("admin_session_" + adminToken);
    if (cached) return true;

    // Validate active admin table
    var admins = getSheetData(SHEETS.ADMINS);
    return admins && admins.some(function(a) { return a.status === "ACTIVE"; });
  } catch (e) {
    return false;
  }
}

function apiSyncStudentProfile(payload) {
  if (!payload || (!payload.email && !payload.firebaseUid && !payload.studentId)) {
    return { success: false, error: "Student profile payload required." };
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.STUDENTS);
  var students = getSheetData(SHEETS.STUDENTS);
  var cleanEmail = payload.email ? String(payload.email).trim().toLowerCase() : "";
  var studentId = payload.studentId || payload.firebaseUid || ("std_" + Date.now());

  var foundRowIndex = -1;
  var existingStudent = null;

  for (var i = 0; i < students.length; i++) {
    var sEmail = students[i].email ? String(students[i].email).trim().toLowerCase() : "";
    var sId = students[i].studentId ? String(students[i].studentId).trim() : "";
    if ((cleanEmail && sEmail === cleanEmail) || (sId === studentId)) {
      foundRowIndex = i + 2;
      existingStudent = students[i];
      break;
    }
  }

  if (foundRowIndex > 0) {
    if (payload.name) sheet.getRange(foundRowIndex, 2).setValue(payload.name);
    if (cleanEmail) sheet.getRange(foundRowIndex, 3).setValue(cleanEmail);
    if (payload.phone) sheet.getRange(foundRowIndex, 4).setValue(payload.phone);
    return {
      success: true,
      data: Object.assign({}, existingStudent, {
        name: payload.name || existingStudent.name,
        email: cleanEmail || existingStudent.email,
        phone: payload.phone || existingStudent.phone,
        studentId: existingStudent.studentId
      })
    };
  } else {
    sheet.appendRow([
      studentId,
      payload.name || "Student",
      cleanEmail,
      payload.phone || "",
      payload.passwordHash || "firebase_oauth",
      payload.createdAt || new Date().toISOString()
    ]);
    return {
      success: true,
      data: {
        studentId: studentId,
        name: payload.name || "Student",
        email: cleanEmail,
        phone: payload.phone || "",
        createdAt: new Date().toISOString()
      }
    };
  }
}

function apiAdminLogin(email, password) {
  if (!email || !password) return { success: false, error: "Credentials required." };
  var cleanEmail = String(email).trim().toLowerCase();
  var admins = getSheetData(SHEETS.ADMINS);
  var hashed = hashString(password);

  for (var i = 0; i < admins.length; i++) {
    if (String(admins[i].email).trim().toLowerCase() === cleanEmail && admins[i].status === "ACTIVE") {
      if (admins[i].passwordHash === hashed) {
        var token = "adm_tok_" + Date.now() + "_" + Math.random().toString(36).substring(2);
        try {
          var cache = CacheService.getScriptCache();
          cache.put("admin_session_" + token, JSON.stringify({
            adminId: admins[i].adminId,
            email: admins[i].email,
            role: admins[i].role
          }), 14400);
        } catch (e) {}

        writeSystemLog("ADMIN_LOGIN", cleanEmail, "Administrator logged in to console");
        return {
          success: true,
          data: {
            adminId: admins[i].adminId,
            email: admins[i].email,
            role: admins[i].role,
            token: token
          }
        };
      } else {
        return { success: false, error: "Invalid password for admin portal." };
      }
    }
  }
  return { success: false, error: "Admin credentials invalid or account not active." };
}

function apiGetSettings() {
  var rows = getSheetData(SHEETS.SETTINGS);
  var obj = {};
  rows.forEach(function (r) {
    if (r.key) obj[r.key] = r.value;
  });
  return { success: true, data: obj };
}

function apiUpdateSettings(settings, adminToken) {
  if (!settings) return { success: false, error: "Settings payload required." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.SETTINGS);
  var data = sheet.getDataRange().getValues();

  for (var key in settings) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(settings[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, settings[key]]);
    }
  }

  writeSystemLog("SETTINGS_UPDATE", adminToken || "admin", "Updated system settings");
  return { success: true, data: settings };
}

function apiGetLogs(adminToken) {
  var logs = getSheetData(SHEETS.LOGS);
  logs.reverse();
  return { success: true, data: logs.slice(0, 100) };
}

// =========================================================================
// HELPER UTILITIES
// =========================================================================

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function formatCourseRow(r) {
  var copy = Object.assign({}, r);
  try { copy.learningOutcomes = JSON.parse(r.learningOutcomes); } catch (e) { copy.learningOutcomes = []; }
  try { copy.prerequisites = JSON.parse(r.prerequisites); } catch (e) { copy.prerequisites = []; }
  try { copy.curriculum = JSON.parse(r.curriculum); } catch (e) { copy.curriculum = []; }
  try { copy.tools = JSON.parse(r.tools); } catch (e) { copy.tools = []; }
  copy.price = Number(r.price) || 0;
  copy.published = (r.published === true || String(r.published).toLowerCase() === "true");
  return copy;
}

function hashString(str) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "orneva_salt_" + str);
  return raw.map(function (b) { return ("0" + (b & 0xFF).toString(16)).slice(-2); }).join("");
}

function writeSystemLog(action, user, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.LOGS);
    if (sheet) {
      sheet.appendRow([new Date().toISOString(), action, user, details]);
    }
  } catch (e) {
    Logger.log("Failed to write log: " + e.message);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
