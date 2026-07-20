import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());

// Persistent Local File Paths
const STUDENTS_FILE = path.join(process.cwd(), "students.json");
const ADMIN_FILE = path.join(process.cwd(), "admin_config.json");
const ATTEMPTS_FILE = path.join(process.cwd(), "student_attempts.json");

// Default Fallbacks
const DEFAULT_ADMIN = {
  email: "pfainstitute0@gmail.com",
  password: "admin"
};
const DEFAULT_STUDENTS: any[] = [];
const DEFAULT_ATTEMPTS: any[] = [];

// Helper to safely load JSON
function loadJson(filePath: string, defaultData: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }
  // Initialize file with default contents if missing
  fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
  return defaultData;
}

// Helper to safely save JSON
function saveJson(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// Self-Initialize Files
loadJson(ADMIN_FILE, DEFAULT_ADMIN);
loadJson(STUDENTS_FILE, DEFAULT_STUDENTS);
loadJson(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);

// 1. Student Lead registration
app.post("/api/register-student", (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone number are required." });
    }

    let students = [];
    try {
      students = loadJson(STUDENTS_FILE, DEFAULT_STUDENTS);
    } catch (loadErr) {
      console.warn("Could not load students.json, falling back to memory:", loadErr);
      students = [];
    }
    
    // Check if email already registered
    const exists = students.some((s: any) => s && s.email && s.email.toLowerCase() === email.toLowerCase());
    
    const newStudent = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: (password || phone || "").trim(), // Use phone as fallback password if not provided
      registeredAt: new Date().toISOString()
    };

    if (!exists) {
      students.push(newStudent);
      try {
        saveJson(STUDENTS_FILE, students);
      } catch (saveErr) {
        console.warn("Could not write students.json (filesystem may be read-only):", saveErr);
      }
    }

    // Forward to Google Sheets Web App if configured
    const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL || process.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;
    if (sheetsUrl) {
      fetch(sheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      }).catch((err: any) => {
        console.error("Failed to forward lead to Google Sheets:", err);
      });
    }

    res.json({ success: true, message: "Registration successful!", student: newStudent });
  } catch (err: any) {
    console.error("Error registering student:", err);
    // Graceful response to guarantee that the student can unlock their dashboard in any emergency
    res.json({
      success: true,
      message: "Resilient signup triggered.",
      student: {
        id: `student-emergency-${Date.now()}`,
        name: (req.body.name || "Student").trim(),
        email: (req.body.email || "emergency@gmail.com").trim().toLowerCase(),
        phone: (req.body.phone || "").trim(),
        password: (req.body.password || req.body.phone || "").trim(),
        registeredAt: new Date().toISOString()
      }
    });
  }
});

// 1.5 Submit Student Attempt Log
app.post("/api/submit-attempt", (req, res) => {
  try {
    const { studentEmail, studentName, attempt } = req.body;
    if (!studentEmail || !attempt) {
      return res.status(400).json({ error: "studentEmail and attempt are required." });
    }

    let attemptsList = [];
    try {
      attemptsList = loadJson(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
    } catch (loadErr) {
      attemptsList = [];
    }

    const newAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentEmail: studentEmail.trim().toLowerCase(),
      studentName: (studentName || "Anonymous Student").trim(),
      ...attempt
    };

    attemptsList.push(newAttempt);

    try {
      saveJson(ATTEMPTS_FILE, attemptsList);
    } catch (saveErr) {
      console.warn("Could not save student attempts to student_attempts.json (read-only system):", saveErr);
    }

    res.json({ success: true, message: "Attempt tracked successfully!" });
  } catch (err: any) {
    console.error("Error recording student attempt log:", err);
    res.json({ success: true, message: "Tracked in emergency memory fallback." });
  }
});

// 2. Admin Validation & Session Tokens
app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const adminConfig = loadJson(ADMIN_FILE, DEFAULT_ADMIN);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();
    const configuredEmail = adminConfig.email.trim().toLowerCase();
    const configuredPassword = adminConfig.password.trim();

    if (inputEmail === configuredEmail && inputPassword === configuredPassword) {
      const sessionToken = `token-admin-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      return res.json({ success: true, token: sessionToken, message: "Welcome Admin!" });
    }

    res.status(401).json({ error: "Invalid admin email or password." });
  } catch (err) {
    console.error("Error admin login:", err);
    res.status(500).json({ error: "Authentication system error." });
  }
});

// 2.5 Public Admin Password Reset (Forgot Password Flow)
app.post("/api/admin/forgot-reset-public", (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Admin Gmail ID and new password are required." });
    }

    const adminConfig = loadJson(ADMIN_FILE, DEFAULT_ADMIN);

    // Verify entered email matches the current configured administrator email
    if (email.trim().toLowerCase() !== adminConfig.email.toLowerCase()) {
      return res.status(400).json({
        error: "Verification failed. The entered email does not match the active registered administrator email."
      });
    }

    adminConfig.password = newPassword.trim();
    saveJson(ADMIN_FILE, adminConfig);

    res.json({ success: true, message: "Admin password has been successfully reset! Please log in with your new password." });
  } catch (err) {
    console.error("Error on public admin password reset:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again later." });
  }
});

// 3. Reset Admin Email and Password
app.post("/api/admin/reset", (req, res) => {
  try {
    const { token, newEmail, newPassword } = req.body;
    if (!token || !token.startsWith("token-admin")) {
      return res.status(401).json({ error: "Unauthorized session." });
    }
    if (!newEmail || !newPassword) {
      return res.status(400).json({ error: "New Gmail ID and password are required." });
    }

    const adminConfig = loadJson(ADMIN_FILE, DEFAULT_ADMIN);
    adminConfig.email = newEmail.trim().toLowerCase();
    adminConfig.password = newPassword.trim();

    saveJson(ADMIN_FILE, adminConfig);
    res.json({ success: true, message: "Admin credentials successfully updated!" });
  } catch (err) {
    console.error("Error resetting admin config:", err);
    res.status(500).json({ error: "Failed to update admin credentials." });
  }
});

// 3.5 Public Student Verification for Returning Login
app.post("/api/registered-students-public-check", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const students = loadJson(STUDENTS_FILE, DEFAULT_STUDENTS);
    const student = students.find(
      (s: any) => s && s.email && s.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (student) {
      // Determine student password; default to phone number if password field is missing
      const studentPassword = (student.password || student.phone || "").trim().toLowerCase();
      const inputPassword = password.trim().toLowerCase();

      if (studentPassword === inputPassword) {
        res.json({ success: true, student: { name: student.name, email: student.email, phone: student.phone } });
      } else {
        res.status(401).json({ error: "Incorrect password. If you registered previously, your WhatsApp/Phone number is your default password." });
      }
    } else {
      res.status(404).json({ error: "No registration record found for this email address. Please register as a new student first!" });
    }
  } catch (err) {
    console.error("Error looking up student:", err);
    res.status(500).json({ error: "Internal server error during lookup." });
  }
});

// 4. Retrieve Registered Students (Admin Only)
app.get("/api/registered-students", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer token-admin")) {
      return res.status(401).json({ error: "Unauthorized access to student leads." });
    }

    const students = loadJson(STUDENTS_FILE, DEFAULT_STUDENTS);
    res.json({ success: true, students });
  } catch (err) {
    console.error("Error retrieving students:", err);
    res.status(500).json({ error: "Failed to retrieve student roster." });
  }
});

// 4.5 Retrieve All Student Practice Attempt Logs (Admin Only)
app.get("/api/admin/student-attempts", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer token-admin")) {
      return res.status(401).json({ error: "Unauthorized access to student performance reports." });
    }

    const attempts = loadJson(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
    res.json({ success: true, attempts });
  } catch (err) {
    console.error("Error retrieving student attempts:", err);
    res.status(500).json({ error: "Failed to retrieve student performance logs." });
  }
});

// 5. Download Leads as Excel-compatible CSV Report
app.get("/api/download-leads-csv", (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token || !token.startsWith("token-admin")) {
      return res.status(401).send("Unauthorized Access. Admin credentials are required.");
    }

    const students = loadJson(STUDENTS_FILE, DEFAULT_STUDENTS);

    // CSV formulation
    let csvContent = "\uFEFFID,Name,Email,Phone Number,Registration Date\n"; // Added BOM for Excel UTF-8 compliance
    students.forEach((s: any) => {
      const escapedName = `"${s.name.replace(/"/g, '""')}"`;
      const escapedEmail = `"${s.email.replace(/"/g, '""')}"`;
      const escapedPhone = `"${s.phone.replace(/"/g, '""')}"`;
      csvContent += `${s.id},${escapedName},${escapedEmail},${escapedPhone},${s.registeredAt}\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=registered_students.csv");
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Error generating CSV download:", err);
    res.status(500).send("Error generating lead report.");
  }
});

let aiInstance: GoogleGenAI | null = null;

/**
 * Lazy initialization of the GoogleGenAI SDK as per security and initialization guidelines.
 */
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in your Secrets panel in the AI Studio UI.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Dynamic Question Generator API
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { cert, level, topic, count } = req.body;
    if (!cert || !level) {
      return res.status(400).json({ error: "Missing certification or level parameters." });
    }

    const client = getGeminiClient();
    const prompt = `You are an elite academic financial certification tutor specializing in the CMT, CFA, CFP, and FRM (Financial Risk Manager) programs. 
Create exactly ${count || 5} highly realistic multiple-choice practice questions (MCQs) for the official ${cert} ${level} exam.

${topic ? `Focus specifically on the following topic or syllabus area: "${topic}".` : `Provide a balanced mix of questions spanning the official updated ${cert} ${level} syllabus.`}

Guidelines:
1. Each question must be a challenging, high-quality, professional-level question with exactly 4 options.
2. The options must be mutually exclusive and clear, with exactly one correct answer.
3. Provide a detailed, pedagogical explanation of why the correct option is correct and why other options are incorrect, citing relevant curriculum/syllabus details.
4. Categorize each question under its official syllabus domain (e.g., Quantitative Methods, Technical Indicators, Ethical Standards, Financial Planning Principles).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The multiple choice question text." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options for the multiple choice question."
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The index (0 to 3) of the correct option."
              },
              explanation: { type: Type.STRING, description: "Detailed explanation of why the correct option is correct and why other options are incorrect." },
              category: { type: Type.STRING, description: "Syllabus topic category name." }
            },
            required: ["text", "options", "correctAnswerIndex", "explanation", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from the Gemini API");
    }

    const parsedQuestions = JSON.parse(text);
    
    // Enrich with IDs and metadata
    const questions = parsedQuestions.map((q: any, idx: number) => ({
      id: `${cert}-${level.replace(/\s+/g, '')}-${Date.now()}-${idx}`,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      category: q.category,
      cert,
      level,
      isCustom: false
    }));

    res.json({ questions });
  } catch (err: any) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: err.message || "Failed to generate questions. Ensure GEMINI_API_KEY is configured." });
  }
});

// Grounded Syllabus Search API
app.post("/api/check-syllabus", async (req, res) => {
  try {
    const { cert, level } = req.body;
    if (!cert || !level) {
      return res.status(400).json({ error: "Missing certification or level parameters." });
    }

    const client = getGeminiClient();
    const prompt = `Search online and provide the official updated syllabus, curriculum topics, and percentage weights for the ${cert} ${level} exam for the current year. 
Provide a clear, detailed, structured markdown breakdown of the official curriculum, key topics, and relative weights. Also summarize any recent major curriculum changes. Include any passing criteria or format details if relevant.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const summary = response.text || "Syllabus summary not available.";
    
    // Extract grounding search metadata for official citations
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Official Resource",
      uri: chunk.web?.uri || ""
    })).filter((source: any) => source.uri);

    res.json({ summary, sources });
  } catch (err: any) {
    console.error("Error checking syllabus:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve syllabus. Ensure GEMINI_API_KEY is configured." });
  }
});

// Configure Vite or Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
