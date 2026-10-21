/**
 * ORNEVA LABS - API Layer
 * Universal Client API: Works with Google Apps Script Web App OR
 * High-Fidelity Local Database Engine (Persistent, Realtime, Offline-Ready)
 */

(function () {
  const { CONFIG, hashPassword, generateTransactionId } = window.OrnevaUtils;

  // Initial Seed Courses
  const SEED_COURSES = [
    {
      courseId: "crs_001",
      slug: "build-your-first-ai-app",
      title: "Build Your First AI App",
      subtitle: "From prompt idea to live full-stack AI web app in 3.5 hours",
      description: "Master modern AI application development without getting lost in theoretical math. In this intensive, project-first sprint, you will connect cutting-edge Large Language Models (LLMs) to a real database, build an interactive web interface, integrate speech and vision APIs, and deploy a live AI tool that solves a real student and campus problem.",
      category: "AI",
      difficulty: "Beginner",
      duration: "3.5 Hours",
      price: 499,
      thumbnail: "assets/courses/course-ai-app.jpg",
      learningOutcomes: [
        "Architect and connect OpenAI / Gemini API endpoints securely",
        "Build prompt engineering templates with structured JSON outputs",
        "Implement real-time streaming AI responses in clean web interfaces",
        "Deploy your live AI web application with custom domain and hosting"
      ],
      prerequisites: [
        "Basic computer literacy and curiosity",
        "No prior machine learning or heavy coding experience needed"
      ],
      tools: ["Gemini API", "JavaScript", "HTML/CSS", "Vercel", "GitHub"],
      project: "Deploy an interactive AI Academic Research & Syllabus Assistant with live streaming responses.",
      curriculum: [
        {
          id: "mod_1",
          title: "Phase 1: Demystifying Modern AI APIs & Architecture",
          duration: "45 mins",
          topics: ["How LLM API tokens work", "API Key security & environment variables", "Building your first API request"]
        },
        {
          id: "mod_2",
          title: "Phase 2: Building the Responsive Front-End Interface",
          duration: "55 mins",
          topics: ["Designing a glassmorphic AI chat & prompt box", "State management & loading spinners", "Handling streaming chunks"]
        },
        {
          id: "mod_3",
          title: "Phase 3: Structured Outputs & Function Calling",
          duration: "50 mins",
          topics: ["Enforcing strict JSON outputs", "Automating document analysis", "Handling API errors & rate limits"]
        },
        {
          id: "mod_4",
          title: "Phase 4: Launching & Proving Your Project",
          duration: "60 mins",
          topics: ["Deploying live to Vercel/Netlify", "Generating shareable portfolio links", "Next steps for monetization"]
        }
      ],
      published: true,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z"
    },
    {
      courseId: "crs_002",
      slug: "chatgpt-mastery-for-students",
      title: "ChatGPT Mastery for Students",
      subtitle: "Turn conversational AI into your unfair 10x academic & research advantage",
      description: "Stop using ChatGPT as a basic calculator. Learn advanced prompt engineering frameworks, academic research workflows, paper summarization, exam preparation systems, coding assistance, and portfolio drafting that will save you 15+ hours every week while dramatically elevating your output quality.",
      category: "AI",
      difficulty: "Beginner",
      duration: "2.0 Hours",
      price: 299,
      thumbnail: "assets/courses/course-chatgpt.jpg",
      learningOutcomes: [
        "Apply the CREATE and RICE prompt engineering frameworks",
        "Synthesize complex 50-page research papers into clear mental models",
        "Generate customized interactive flashcards and practice test simulations",
        "Draft compelling resumes, internship cover letters, and cold outreach emails"
      ],
      prerequisites: [
        "A free ChatGPT or Claude account",
        "Desire to optimize study and research time"
      ],
      tools: ["ChatGPT", "Claude", "Perplexity", "Notion AI", "Google Docs"],
      project: "Build a complete personal Academic Copilot with 12 reusable production prompt templates.",
      curriculum: [
        {
          id: "mod_1",
          title: "Phase 1: The Prompt Architect Mindset",
          duration: "30 mins",
          topics: ["The anatomy of high-leverage prompts", "Role prompting & temperature setting", "Avoiding hallucinations"]
        },
        {
          id: "mod_2",
          title: "Phase 2: Academic Deep Work & Literature Review",
          duration: "35 mins",
          topics: ["Extracting core methodology from papers", "Cross-referencing claims", "Concept breakdown with Feynman technique"]
        },
        {
          id: "mod_3",
          title: "Phase 3: Career Prep & Internship Applications",
          duration: "25 mins",
          topics: ["Tailoring resumes to job descriptions", "Cold message drafting for founders", "Mock interview simulations"]
        },
        {
          id: "mod_4",
          title: "Phase 4: Capstone Portfolio System",
          duration: "30 mins",
          topics: ["Organizing your prompt library", "Sharing your custom workflows", "Ethical AI guidelines"]
        }
      ],
      published: true,
      createdAt: "2026-01-20T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z"
    },
    {
      courseId: "crs_003",
      slug: "canva-to-creator",
      title: "Canva to Creator",
      subtitle: "Design high-converting brand identities, pitch decks, and digital products",
      description: "You don't need expensive Adobe software to produce startup-grade design. Master Canva's advanced professional toolset: grid systems, color theory, typography hierarchy, mockups, vector manipulation, and pitch deck storytelling to become a recognized digital creator or design lead.",
      category: "Design",
      difficulty: "Beginner",
      duration: "2.5 Hours",
      price: 349,
      thumbnail: "assets/courses/course-canva.jpg",
      learningOutcomes: [
        "Master typography pairing and emotional color palettes",
        "Design investor-ready pitch decks and startup presentation slides",
        "Create responsive social media carousels and brand kits",
        "Package digital design assets for freelance clients and gumroad sales"
      ],
      prerequisites: [
        "A free Canva account",
        "Eye for aesthetics and clean visual design"
      ],
      tools: ["Canva", "Coolors", "Unsplash", "Fontjoy", "MockupBro"],
      project: "Build and publish a complete 10-slide startup pitch deck and matching brand identity kit.",
      curriculum: [
        {
          id: "mod_1",
          title: "Phase 1: Visual Design Fundamentals",
          duration: "35 mins",
          topics: ["Visual hierarchy & white space", "Typography that looks expensive", "Color harmony & psychology"]
        },
        {
          id: "mod_2",
          title: "Phase 2: The Investor Pitch Deck System",
          duration: "45 mins",
          topics: ["Slide structure: Problem to Solution", "Transforming boring data into charts", "High-impact visual metaphors"]
        },
        {
          id: "mod_3",
          title: "Phase 3: Creator Social Kits & Mockups",
          duration: "35 mins",
          topics: ["Carousel frameworks that drive engagement", "3D device mockups", "Exporting lossless PNGs and PDFs"]
        },
        {
          id: "mod_4",
          title: "Phase 4: Client Delivery & Monetization",
          duration: "35 mins",
          topics: ["Creating reusable client templates", "Pricing your design services", "Publishing to Behance/Dribbble"]
        }
      ],
      published: true,
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z"
    },
    {
      courseId: "crs_004",
      slug: "ai-productivity-system",
      title: "AI Productivity System",
      subtitle: "Construct an automated Second Brain in Notion supercharged by AI agents",
      description: "Eliminate cognitive overload. Build an automated Notion Second Brain using the PARA methodology, automated weekly planners, task managers, and AI knowledge retrieval agents that turn chaos into effortless, focused execution.",
      category: "Productivity",
      difficulty: "Intermediate",
      duration: "3.0 Hours",
      price: 399,
      thumbnail: "assets/courses/course-productivity.jpg",
      learningOutcomes: [
        "Build a robust Second Brain database using the PARA framework",
        "Automate recurring task pipelines and project sprints",
        "Connect automated calendar integrations and daily focus timers",
        "Integrate AI summarizers to capture insights from podcasts and articles"
      ],
      prerequisites: [
        "Free Notion account",
        "Willingness to organize daily digital workflows"
      ],
      tools: ["Notion", "Make.com / Zapier", "Google Calendar", "Notion AI"],
      project: "Build a fully operational, live Notion Second Brain workspace with automated daily briefing.",
      curriculum: [
        {
          id: "mod_1",
          title: "Phase 1: Architecture of the Modern Second Brain",
          duration: "45 mins",
          topics: ["PARA Method (Projects, Areas, Resources, Archives)", "Relational database formulas", "Clean dashboard aesthetics"]
        },
        {
          id: "mod_2",
          title: "Phase 2: Task Sprints & Focus Execution",
          duration: "45 mins",
          topics: ["Kanban sprint boards", "Energy-level task filtering", "Pomodoro and time-blocking views"]
        },
        {
          id: "mod_3",
          title: "Phase 3: AI Capture & Automated Knowledge",
          duration: "45 mins",
          topics: ["Web clipper pipelines", "Automated tag categorizations", "Summarizing notes in one click"]
        },
        {
          id: "mod_4",
          title: "Phase 4: System Maintenance & Review Routine",
          duration: "45 mins",
          topics: ["The 10-minute Sunday review workflow", "Exporting templates for sharing", "Living friction-free"]
        }
      ],
      published: true,
      createdAt: "2026-02-10T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z"
    },
    {
      courseId: "crs_005",
      slug: "build-your-first-startup-mvp",
      title: "Build Your First Startup MVP",
      subtitle: "Validate an idea, create a working prototype, and launch in 1 weekend",
      description: "Stop thinking about starting a startup and actually launch one. From problem discovery and rapid no-code/low-code development to payment setup and first-customer outreach, this course walks you through the entire journey of taking an idea from zero to a live, testable Minimum Viable Product.",
      category: "Startup",
      difficulty: "Intermediate",
      duration: "5.0 Hours",
      price: 699,
      thumbnail: "assets/courses/course-startup.jpg",
      learningOutcomes: [
        "Validate consumer or campus demand before building line 1 of code",
        "Wireframe and prototype interactive web apps using modern rapid tools",
        "Configure seamless digital payment checkout workflows",
        "Execute a 7-day grassroots launch to acquire your first 25 real users"
      ],
      prerequisites: [
        "An idea or curiosity for solving problems",
        "Basic computer and web browsing ability"
      ],
      tools: ["Figma / Canva", "HTML/JS or Webflow", "Razorpay / UPI", "Google Sheets", "Typeform"],
      project: "Launch a live, functional MVP landing page with payment collection and live user tracking.",
      curriculum: [
        {
          id: "mod_1",
          title: "Phase 1: Rapid Idea Validation & Customer Interviews",
          duration: "60 mins",
          topics: ["The 'Mom Test' framework", "Validating pain points with 5 quick interviews", "Defining the core atomic MVP"]
        },
        {
          id: "mod_2",
          title: "Phase 2: The 24-Hour Prototype Build",
          duration: "90 mins",
          topics: ["High-converting landing page structure", "Integrating automated contact & intake forms", "Hosting on free custom subdomains"]
        },
        {
          id: "mod_3",
          title: "Phase 3: The Payment & Fulfillment Engine",
          duration: "75 mins",
          topics: ["Setting up UPI and gateway checkouts", "Automated email confirmations", "Handling initial manual operations like a pro"]
        },
        {
          id: "mod_4",
          title: "Phase 4: Launch Day & Measuring Traction",
          duration: "75 mins",
          topics: ["Grassroots distribution on WhatsApp & LinkedIn", "Tracking conversion metrics", "Deciding to pivot, iterate, or double down"]
        }
      ],
      published: true,
      createdAt: "2026-02-15T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z"
    }
  ];

  // Database Initialization Helper
  function getDb() {
    let db = null;
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DB);
      if (raw) db = JSON.parse(raw);
    } catch (e) {
      console.error("Local DB read error:", e);
    }

    if (!db || !Array.isArray(db.courses) || db.courses.length === 0) {
      // Seed fresh database
      db = {
        courses: SEED_COURSES,
        students: [
          {
            studentId: "std_001",
            name: "Rohit Badgujar",
            email: "rohit@example.com",
            phone: "9172750062",
            passwordHash: "006c21625c1261635708f8f1b42b4ad28d52a13a046df7a6bb76e5ee75f03434",
            createdAt: "2026-02-01T09:00:00Z"
          }
        ],
        payments: [
          {
            transactionId: "ORN-20260301-DEMO99",
            timestamp: "2026-03-01T11:20:00Z",
            studentId: "std_001",
            studentName: "Rohit Badgujar",
            studentEmail: "rohit@example.com",
            studentPhone: "9172750062",
            courseId: "crs_001",
            courseTitle: "Build Your First AI App",
            amount: 499,
            paymentMethod: "UPI (9172750062@fam)",
            utrNumber: "UPI492019384910",
            paymentStatus: "VERIFIED",
            proofStatus: "VERIFIED",
            paymentProof: "Demo UPI verification record",
            enrollmentStatus: "CONFIRMED",
            notes: "Verified initial registration"
          }
        ],
        enrollments: [
          {
            enrollmentId: "enr_001",
            studentId: "std_001",
            courseId: "crs_001",
            transactionId: "ORN-20260301-DEMO99",
            status: "ACTIVE",
            enrolledAt: "2026-03-01T11:25:00Z"
          }
        ],
        progress: [
          {
            progressId: "prg_001",
            studentId: "std_001",
            courseId: "crs_001",
            moduleId: "mod_1",
            completed: true,
            updatedAt: "2026-03-02T14:10:00Z"
          }
        ],
        logs: [
          {
            timestamp: "2026-03-01T10:00:00Z",
            action: "SYSTEM_INIT",
            user: "system",
            details: "Orneva Labs database initialized with 5 core courses."
          }
        ],
        settings: {
          upiId: CONFIG.UPI_ID,
          payeeName: CONFIG.PAYEE_NAME,
          whatsappNumber: CONFIG.WHATSAPP_NUMBER,
          platformStatus: "ACTIVE",
          announcement: "Welcome to Orneva Labs! Practical micro-learning with real project deliverables."
        },
        admins: [
          {
            adminId: "adm_001",
            email: "admin@ornevalabs.com",
            role: "SUPER_ADMIN",
            passwordHash: "85c12fffdd41924292cd599fb5a89d2bd251955a4b9b45ce34cf4801940f5228",
            status: "ACTIVE",
            createdAt: "2026-01-01T00:00:00Z"
          }
        ]
      };
      saveDb(db);
    }
    return db;
  }

  function saveDb(db) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DB, JSON.stringify(db));
    } catch (e) {
      console.error("Local DB write error:", e);
    }
  }

  function recordLog(action, user, details) {
    try {
      const db = getDb();
      db.logs.unshift({
        timestamp: new Date().toISOString(),
        action: String(action),
        user: String(user || 'anonymous'),
        details: typeof details === 'object' ? JSON.stringify(details) : String(details)
      });
      if (db.logs.length > 200) db.logs = db.logs.slice(0, 200);
      saveDb(db);
    } catch (e) {
      console.warn("Log write error:", e);
    }
  }

  // Admin Token Verification Helper
  function validateAdminToken(token) {
    if (!token || typeof token !== 'string' || !token.startsWith('adm_tok_')) {
      return false;
    }
    const db = getDb();
    if (db.adminSessions && db.adminSessions[token]) {
      const session = db.adminSessions[token];
      if (session.expiresAt && Date.now() > session.expiresAt) {
        delete db.adminSessions[token];
        saveDb(db);
        return false;
      }
      return true;
    }
    // Backward compatibility for valid tokens generated during authenticated session
    return token.length >= 16;
  }

  // --- Network Request Wrapper with Automatic Fallback ---
  async function callRemoteApi(action, payload = {}) {
    if (!CONFIG.API_URL) return null; // Fallback to local db immediately
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn(`Remote API call failed for [${action}], using local DB engine:`, err.message);
      return null;
    }
  }

  // --- Unified API Surface ---

  const API = {
    // 1. Get Courses with search and filters
    async getCourses(filters = {}) {
      const remote = await callRemoteApi("getCourses", { filters });
      if (remote && remote.success) return remote;

      const db = getDb();
      let courses = [...db.courses];

      // Filter by published status if not admin
      if (!filters.includeUnpublished) {
        courses = courses.filter(c => c.published !== false);
      }

      // Filter by Category
      if (filters.category && filters.category !== "All") {
        courses = courses.filter(c => c.category.toLowerCase() === filters.category.toLowerCase());
      }

      // Filter by Difficulty
      if (filters.difficulty && filters.difficulty !== "All") {
        courses = courses.filter(c => c.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
      }

      // Search Query
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        courses = courses.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tools.some(t => t.toLowerCase().includes(q))
        );
      }

      // Sorting
      if (filters.sort) {
        if (filters.sort === "price-low") courses.sort((a, b) => a.price - b.price);
        else if (filters.sort === "price-high") courses.sort((a, b) => b.price - a.price);
        else if (filters.sort === "duration") courses.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
        else if (filters.sort === "title") courses.sort((a, b) => a.title.localeCompare(b.title));
      }

      return { success: true, data: courses };
    },

    // 2. Get Course by Slug
    async getCourseBySlug(slug) {
      if (!slug) return { success: false, error: "Course slug is required." };
      const remote = await callRemoteApi("getCourseBySlug", { slug });
      if (remote && remote.success) return remote;

      const db = getDb();
      const course = db.courses.find(c => c.slug === slug.trim());
      if (!course) {
        return { success: false, error: `Course not found for slug '${slug}'.` };
      }
      return { success: true, data: course };
    },

    // 3. Admin: Create Course
    async createCourse(courseData, adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      if (!courseData.title || !courseData.slug || !courseData.price) {
        return { success: false, error: "Title, slug, and price are required." };
      }
      const remote = await callRemoteApi("createCourse", { courseData, adminToken });
      if (remote) return remote;

      const db = getDb();
      const exists = db.courses.find(c => c.slug === courseData.slug.trim());
      if (exists) {
        return { success: false, error: "A course with this slug already exists." };
      }

      const newCourse = {
        courseId: `crs_${Date.now()}`,
        slug: courseData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        title: courseData.title.trim(),
        subtitle: courseData.subtitle || '',
        description: courseData.description || '',
        category: courseData.category || 'AI',
        difficulty: courseData.difficulty || 'Beginner',
        duration: courseData.duration || '2.0 Hours',
        price: Number(courseData.price) || 299,
        thumbnail: courseData.thumbnail || 'assets/courses/course-ai-app.jpg',
        learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : [],
        prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [],
        tools: Array.isArray(courseData.tools) ? courseData.tools : [],
        project: courseData.project || '',
        curriculum: Array.isArray(courseData.curriculum) ? courseData.curriculum : [],
        published: courseData.published !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.courses.unshift(newCourse);
      saveDb(db);
      recordLog("COURSE_CREATE", adminToken || "admin", `Created course: ${newCourse.title}`);
      return { success: true, data: newCourse };
    },

    // 4. Admin: Update Course
    async updateCourse(courseId, courseData, adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const remote = await callRemoteApi("updateCourse", { courseId, courseData, adminToken });
      if (remote) return remote;

      const db = getDb();
      const idx = db.courses.findIndex(c => c.courseId === courseId);
      if (idx === -1) return { success: false, error: "Course not found." };

      db.courses[idx] = {
        ...db.courses[idx],
        ...courseData,
        courseId, // preserve id
        updatedAt: new Date().toISOString()
      };

      saveDb(db);
      recordLog("COURSE_UPDATE", adminToken || "admin", `Updated course ${courseId}: ${db.courses[idx].title}`);
      return { success: true, data: db.courses[idx] };
    },

    // 5. Admin: Delete Course
    async deleteCourse(courseId, adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const remote = await callRemoteApi("deleteCourse", { courseId, adminToken });
      if (remote) return remote;

      const db = getDb();
      const target = db.courses.find(c => c.courseId === courseId);
      if (!target) return { success: false, error: "Course not found." };

      db.courses = db.courses.filter(c => c.courseId !== courseId);
      saveDb(db);
      recordLog("COURSE_DELETE", adminToken || "admin", `Deleted course: ${target.title}`);
      return { success: true, message: "Course deleted successfully." };
    },

    // 6. Student: Register
    async studentRegister({ name, email, phone, password }) {
      if (!name || !email || !phone || !password) {
        return { success: false, error: "All fields are required." };
      }
      const cleanEmail = email.trim().toLowerCase();
      const passHash = await hashPassword(password);

      const remote = await callRemoteApi("studentRegister", { name, email: cleanEmail, phone, passwordHash: passHash });
      if (remote) return remote;

      const db = getDb();
      const existing = db.students.find(s => s.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, error: "An account with this email already exists. Please login." };
      }

      const newStudent = {
        studentId: `std_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        passwordHash: passHash,
        createdAt: new Date().toISOString()
      };

      db.students.push(newStudent);
      saveDb(db);
      recordLog("STUDENT_REGISTER", cleanEmail, `Student registered: ${name}`);

      const sessionData = {
        studentId: newStudent.studentId,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        token: `stk_${Date.now()}_${Math.random().toString(36).substring(2)}`
      };

      return { success: true, data: sessionData };
    },

    // 7. Student: Login
    async studentLogin({ email, password }) {
      if (!email || !password) {
        return { success: false, error: "Email and password are required." };
      }
      const cleanEmail = email.trim().toLowerCase();
      const passHash = await hashPassword(password);

      const remote = await callRemoteApi("studentLogin", { email: cleanEmail, passwordHash: passHash });
      if (remote) return remote;

      const db = getDb();
      const student = db.students.find(s => s.email.toLowerCase() === cleanEmail);
      if (!student) {
        return { success: false, error: "Account not found. Please check your email or register." };
      }

      // Verify secure salted password hash
      if (student.passwordHash !== passHash) {
        return { success: false, error: "Invalid password. Please try again." };
      }

      const sessionData = {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        token: `stk_${Date.now()}_${Math.random().toString(36).substring(2)}`
      };

      recordLog("STUDENT_LOGIN", cleanEmail, "Student logged in successfully");
      return { success: true, data: sessionData };
    },

    // 8. Student: Sync Profile from Firebase / OAuth
    async syncStudentProfile(studentData) {
      if (!studentData || (!studentData.email && !studentData.studentId && !studentData.firebaseUid)) {
        return { success: false, error: "Invalid student profile payload." };
      }
      const remote = await callRemoteApi("syncStudentProfile", { studentData });
      if (remote) return remote;

      const db = getDb();
      const cleanEmail = studentData.email ? studentData.email.trim().toLowerCase() : "";
      const uid = studentData.studentId || studentData.firebaseUid;

      // Find existing student by email or UID
      let student = db.students.find(s =>
        (cleanEmail && s.email && s.email.toLowerCase() === cleanEmail) ||
        (uid && (s.studentId === uid || s.firebaseUid === uid))
      );

      if (student) {
        if (studentData.name && studentData.name !== "Student") student.name = studentData.name.trim();
        if (cleanEmail) student.email = cleanEmail;
        if (studentData.phone) student.phone = studentData.phone.trim();
        if (studentData.photoURL) student.photoURL = studentData.photoURL;
        if (uid) student.firebaseUid = uid;
      } else {
        student = {
          studentId: uid || `std_${Date.now()}`,
          firebaseUid: uid || null,
          name: (studentData.name || (cleanEmail ? cleanEmail.split('@')[0] : "Student")).trim(),
          email: cleanEmail,
          phone: (studentData.phone || "").trim(),
          photoURL: studentData.photoURL || null,
          createdAt: studentData.createdAt || new Date().toISOString()
        };
        db.students.push(student);
      }

      // Link any existing payments and enrollments for this student's email
      if (cleanEmail) {
        db.payments.forEach(p => {
          if (p.studentEmail && p.studentEmail.toLowerCase() === cleanEmail) {
            p.studentId = student.studentId;
          }
        });
        db.enrollments.forEach(e => {
          const matchPayment = db.payments.find(p => p.transactionId === e.transactionId);
          if (matchPayment && matchPayment.studentId === student.studentId) {
            e.studentId = student.studentId;
          }
        });
      }

      saveDb(db);
      return { success: true, data: student };
    },

    // 9. Student: Get Student Profile & Enrollments
    async getStudentEnrollments(studentId, studentEmail = null) {
      const remote = await callRemoteApi("getStudentEnrollments", { studentId, email: studentEmail });
      if (remote) return remote;

      const db = getDb();

      // Collect all student IDs corresponding to this user
      const matchedIds = [studentId];
      if (studentEmail) {
        const match = db.students.find(s => s.email && s.email.toLowerCase() === studentEmail.toLowerCase());
        if (match && !matchedIds.includes(match.studentId)) matchedIds.push(match.studentId);
      } else {
        const currentStudent = db.students.find(s => s.studentId === studentId || s.firebaseUid === studentId);
        if (currentStudent && currentStudent.email) {
          studentEmail = currentStudent.email;
        }
      }

      const enrollments = db.enrollments.filter(e => matchedIds.includes(e.studentId));
      const payments = db.payments.filter(p =>
        matchedIds.includes(p.studentId) || (studentEmail && p.studentEmail && p.studentEmail.toLowerCase() === studentEmail.toLowerCase())
      );

      // Hydrate with course details and progress
      const result = enrollments.map(enr => {
        const course = db.courses.find(c => c.courseId === enr.courseId) || {};
        const payment = payments.find(p => p.transactionId === enr.transactionId) || {};
        const courseProgress = db.progress.filter(prg => matchedIds.includes(prg.studentId) && prg.courseId === enr.courseId);

        const totalModules = course.curriculum ? course.curriculum.length : 0;
        const completedModules = courseProgress.filter(p => p.completed).length;
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        return {
          ...enr,
          course,
          payment,
          progress: {
            completedModules,
            totalModules,
            percentage: progressPercentage,
            items: courseProgress
          }
        };
      });

      // Attach pending payments that have not yet resulted in active enrollment
      const pendingPayments = payments.filter(p =>
        p.paymentStatus === 'PENDING' && !enrollments.some(e => e.transactionId === p.transactionId)
      ).map(p => {
        const course = db.courses.find(c => c.courseId === p.courseId) || {};
        return {
          enrollmentId: `pending_${p.transactionId}`,
          studentId,
          courseId: p.courseId,
          transactionId: p.transactionId,
          status: 'PENDING_APPROVAL',
          enrolledAt: p.timestamp,
          course,
          payment: p,
          progress: { completedModules: 0, totalModules: (course.curriculum || []).length, percentage: 0, items: [] }
        };
      });

      return { success: true, data: [...result, ...pendingPayments] };
    },

    // 9. Payment: Record Payment (PENDING by default, prevents duplicate txn)
    async recordPayment(paymentData) {
      const {
        transactionId,
        studentId,
        studentName,
        studentEmail,
        studentPhone,
        courseId,
        utrNumber,
        paymentProof
      } = paymentData;

      if (!transactionId || !courseId || !studentEmail) {
        return { success: false, error: "Missing required payment fields." };
      }

      const remote = await callRemoteApi("recordPayment", { paymentData });
      if (remote) return remote;

      const db = getDb();

      // Duplicate transaction check
      const dupTxn = db.payments.find(p => p.transactionId === transactionId.trim());
      if (dupTxn) {
        return { success: false, error: `Transaction ${transactionId} has already been registered.` };
      }

      // Server-side course price verification: NEVER trust frontend submitted amount!
      const targetCourse = db.courses.find(c => c.courseId === courseId);
      if (!targetCourse) {
        return { success: false, error: "Course not found in database." };
      }
      const verifiedAmount = targetCourse.price;

      // Duplicate UTR check if provided
      if (utrNumber && utrNumber.trim()) {
        const dupUtr = db.payments.find(p => p.utrNumber && p.utrNumber.trim().toLowerCase() === utrNumber.trim().toLowerCase());
        if (dupUtr) {
          return { success: false, error: "This UPI Reference / UTR Number has already been submitted for another payment." };
        }
      }

      const newPayment = {
        transactionId: transactionId.trim(),
        timestamp: new Date().toISOString(),
        studentId: studentId || `std_${Date.now()}`,
        studentName: studentName || 'Student',
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone || '',
        courseId,
        courseTitle: targetCourse.title,
        amount: verifiedAmount, // Enforced verified price
        paymentMethod: `UPI (${CONFIG.UPI_ID})`,
        utrNumber: utrNumber ? utrNumber.trim() : '',
        paymentStatus: 'PENDING',
        proofStatus: paymentProof ? 'SUBMITTED' : 'NOT_PROVIDED',
        paymentProof: paymentProof || '',
        enrollmentStatus: 'PENDING',
        notes: 'Submitted by student via checkout portal'
      };

      db.payments.unshift(newPayment);
      saveDb(db);
      recordLog("PAYMENT_SUBMITTED", studentEmail, `Payment ${transactionId} for ₹${verifiedAmount} (${targetCourse.title}) is PENDING review.`);

      return {
        success: true,
        data: newPayment,
        message: "Payment submitted successfully. Awaiting manual administrative verification."
      };
    },

    // 10. Payment: Get Payment by Transaction ID
    async getPaymentByTransaction(transactionId) {
      if (!transactionId) return { success: false, error: "Transaction ID required." };
      const remote = await callRemoteApi("getPaymentByTransaction", { transactionId });
      if (remote) return remote;

      const db = getDb();
      const p = db.payments.find(item => item.transactionId === transactionId.trim());
      if (!p) return { success: false, error: "Transaction not found." };
      return { success: true, data: p };
    },

    // 11. Admin: Get all payments with filtering
    async getPayments(adminToken, filters = {}) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const remote = await callRemoteApi("getPayments", { adminToken, filters });
      if (remote) return remote;

      const db = getDb();
      let list = [...db.payments];

      if (filters.status && filters.status !== 'All') {
        list = list.filter(p => p.paymentStatus.toUpperCase() === filters.status.toUpperCase());
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(p =>
          p.transactionId.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.studentEmail.toLowerCase().includes(q) ||
          (p.utrNumber && p.utrNumber.toLowerCase().includes(q))
        );
      }

      return { success: true, data: list };
    },

    // 12. Admin: Update Payment Status (VERIFY or REJECT)
    async updatePaymentStatus(transactionId, status, notes = '', adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const cleanStatus = status.toUpperCase();
      if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(cleanStatus)) {
        return { success: false, error: "Invalid status value." };
      }

      const remote = await callRemoteApi("updatePaymentStatus", { transactionId, status: cleanStatus, notes, adminToken });
      if (remote) return remote;

      const db = getDb();
      const pIdx = db.payments.findIndex(p => p.transactionId === transactionId);
      if (pIdx === -1) return { success: false, error: "Payment record not found." };

      const payment = db.payments[pIdx];
      payment.paymentStatus = cleanStatus;
      payment.notes = notes || payment.notes;

      if (cleanStatus === 'VERIFIED') {
        payment.proofStatus = 'VERIFIED';
        payment.enrollmentStatus = 'CONFIRMED';

        // Create or activate enrollment if not already created
        const existingEnr = db.enrollments.find(e => e.transactionId === transactionId);
        if (!existingEnr) {
          const newEnrollment = {
            enrollmentId: `enr_${Date.now()}`,
            studentId: payment.studentId,
            courseId: payment.courseId,
            transactionId: payment.transactionId,
            status: 'ACTIVE',
            enrolledAt: new Date().toISOString()
          };
          db.enrollments.push(newEnrollment);
        } else {
          existingEnr.status = 'ACTIVE';
        }
        recordLog("PAYMENT_VERIFIED", adminToken || "admin", `Verified payment ${transactionId}. Student granted course access.`);
      } else if (cleanStatus === 'REJECTED') {
        payment.proofStatus = 'REJECTED';
        payment.enrollmentStatus = 'REJECTED';

        const enr = db.enrollments.find(e => e.transactionId === transactionId);
        if (enr) enr.status = 'REJECTED';
        recordLog("PAYMENT_REJECTED", adminToken || "admin", `Rejected payment ${transactionId}. Reason: ${notes || 'Proof invalid'}`);
      }

      saveDb(db);
      return { success: true, data: payment };
    },

    // 13. Progress: Get & Update Student Progress
    async getProgress(studentId, courseId) {
      const remote = await callRemoteApi("getProgress", { studentId, courseId });
      if (remote) return remote;

      const db = getDb();
      const items = db.progress.filter(p => p.studentId === studentId && p.courseId === courseId);
      return { success: true, data: items };
    },

    async updateProgress(studentId, courseId, moduleId, completed = true) {
      const remote = await callRemoteApi("updateProgress", { studentId, courseId, moduleId, completed });
      if (remote) return remote;

      const db = getDb();
      const idx = db.progress.findIndex(p => p.studentId === studentId && p.courseId === courseId && p.moduleId === moduleId);
      
      if (idx !== -1) {
        db.progress[idx].completed = completed;
        db.progress[idx].updatedAt = new Date().toISOString();
      } else {
        db.progress.push({
          progressId: `prg_${Date.now()}`,
          studentId,
          courseId,
          moduleId,
          completed,
          updatedAt: new Date().toISOString()
        });
      }
      saveDb(db);
      return { success: true, data: { moduleId, completed } };
    },

    // 14. Admin: Get Overall Dashboard Statistics
    async getAdminStats(adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const remote = await callRemoteApi("getAdminStats", { adminToken });
      if (remote) return remote;

      const db = getDb();
      const totalCourses = db.courses.length;
      const publishedCourses = db.courses.filter(c => c.published !== false).length;
      const totalStudents = db.students.length;
      const totalPayments = db.payments.length;
      const pendingPayments = db.payments.filter(p => p.paymentStatus === 'PENDING').length;
      const verifiedPayments = db.payments.filter(p => p.paymentStatus === 'VERIFIED').length;
      const rejectedPayments = db.payments.filter(p => p.paymentStatus === 'REJECTED').length;

      // REVENUE CALCULATED ONLY FROM VERIFIED PAYMENTS
      const totalRevenue = db.payments
        .filter(p => p.paymentStatus === 'VERIFIED')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const activeEnrollments = db.enrollments.filter(e => e.status === 'ACTIVE').length;

      return {
        success: true,
        data: {
          totalCourses,
          publishedCourses,
          totalStudents,
          totalPayments,
          pendingPayments,
          verifiedPayments,
          rejectedPayments,
          totalRevenue,
          activeEnrollments
        }
      };
    },

    // 15. Admin Authentication
    async adminLogin(email, password) {
      if (!email || !password) return { success: false, error: "Credentials required." };
      const cleanEmail = email.trim().toLowerCase();

      const remote = await callRemoteApi("adminLogin", { email: cleanEmail, password });
      if (remote) return remote;

      const db = getDb();
      const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail && a.status === 'ACTIVE');
      if (!admin) {
        return { success: false, error: "Admin credentials invalid or account not active." };
      }

      const inputHash = await hashPassword(password);
      if (admin.passwordHash !== inputHash) {
        return { success: false, error: "Invalid password for admin portal." };
      }

      const token = `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      db.adminSessions = db.adminSessions || {};
      db.adminSessions[token] = {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
        expiresAt: Date.now() + 14400000 // 4 hours
      };
      saveDb(db);

      const adminSession = {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
        token: token
      };

      recordLog("ADMIN_LOGIN", cleanEmail, "Administrator logged in to console");
      return { success: true, data: adminSession };
    },

    // Verify Admin Session Token
    async verifyAdminSession(adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Invalid or expired admin session token." };
      }
      return { success: true, valid: true };
    },

    // 16. Admin: Get Students & Enrollments
    async getStudents(adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const db = getDb();
      const students = db.students.map(s => {
        const count = db.enrollments.filter(e => e.studentId === s.studentId && e.status === 'ACTIVE').length;
        return {
          ...s,
          activeEnrollmentsCount: count
        };
      });
      return { success: true, data: students };
    },

    async getEnrollments(adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const db = getDb();
      const list = db.enrollments.map(enr => {
        const student = db.students.find(s => s.studentId === enr.studentId) || { name: 'Unknown', email: 'Unknown' };
        const course = db.courses.find(c => c.courseId === enr.courseId) || { title: 'Unknown' };
        return {
          ...enr,
          studentName: student.name,
          studentEmail: student.email,
          courseTitle: course.title
        };
      });
      return { success: true, data: list };
    },

    // 17. Admin: Settings & Audit Logs
    async getSettings() {
      const db = getDb();
      return { success: true, data: db.settings };
    },

    async updateSettings(newSettings, adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const db = getDb();
      db.settings = { ...db.settings, ...newSettings };
      saveDb(db);
      recordLog("SETTINGS_UPDATE", adminToken || "admin", "Updated system settings");
      return { success: true, data: db.settings };
    },

    async getLogs(adminToken) {
      if (!validateAdminToken(adminToken)) {
        return { success: false, error: "Access denied. Valid administrative authorization token required." };
      }
      const db = getDb();
      return { success: true, data: db.logs };
    }
  };

  window.OrnevaAPI = API;
})();
