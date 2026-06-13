import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import * as geminiService from "./server/gemini";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini API Proxy Routes
  app.post("/api/gemini/analyze-health", async (req, res) => {
    try {
      const data = await geminiService.analyzeHealthData(req.body);
      res.json(data);
    } catch (err: any) {
      console.error("Error in analyze-health:", err);
      res.status(500).json({ error: err?.message || "Failed to analyze health data" });
    }
  });

  app.post("/api/gemini/analyze-meal", async (req, res) => {
    try {
      const { description, userStatus } = req.body;
      const data = await geminiService.analyzeMeal(description, userStatus);
      res.json(data);
    } catch (err: any) {
      console.error("Error in analyze-meal:", err);
      res.status(500).json({ error: err?.message || "Failed to analyze meal" });
    }
  });

  app.post("/api/gemini/get-food-info", async (req, res) => {
    try {
      const { foodName } = req.body;
      const data = await geminiService.getFoodGIInfo(foodName);
      res.json(data);
    } catch (err: any) {
      console.error("Error in get-food-info:", err);
      res.status(500).json({ error: err?.message || "Failed to get food GI info" });
    }
  });

  app.post("/api/gemini/get-ethnic-recommendations", async (req, res) => {
    try {
      const { ethnicity, preference } = req.body;
      const data = await geminiService.getEthnicMealRecommendations(ethnicity, preference);
      res.json(data);
    } catch (err: any) {
      console.error("Error in get-ethnic-recommendations:", err);
      res.status(500).json({ error: err?.message || "Failed to get ethnic recommendations" });
    }
  });

  app.post("/api/gemini/get-exercise-plans", async (req, res) => {
    try {
      const { assessment, age, equipment } = req.body;
      const data = await geminiService.getPersonalizedExercisePlans(assessment, age, equipment);
      res.json(data);
    } catch (err: any) {
      console.error("Error in get-exercise-plans:", err);
      res.status(500).json({ error: err?.message || "Failed to get exercise plans" });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const data = await geminiService.sendChatMessage(messages, systemInstruction);
      res.json({ text: data });
    } catch (err: any) {
      console.error("Error in chat:", err);
      res.status(500).json({ error: err?.message || "Failed to send chat message" });
    }
  });

  app.post("/api/gemini/analyze-image", async (req, res) => {
    try {
      const { base64, mimeType } = req.body;
      const data = await geminiService.analyzeImage(base64, mimeType);
      res.json({ text: data });
    } catch (err: any) {
      console.error("Error in analyze-image:", err);
      res.status(500).json({ error: err?.message || "Failed to analyze image" });
    }
  });

  app.post("/api/gemini/sources", async (req, res) => {
    try {
      const { topic } = req.body;
      const data = await geminiService.getSources(topic);
      res.json(data);
    } catch (err: any) {
      console.error("Error in sources:", err);
      res.status(500).json({ error: err?.message || "Failed to get sources" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
