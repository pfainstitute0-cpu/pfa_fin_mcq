import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());

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
