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

  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, message, category, rating } = req.body;
      const { default: nodemailer } = await import("nodemailer");

      if (!email || !message) {
        res.status(400).json({ error: "Email and message are required" });
        return;
      }

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      console.log(`[Feedback Received] Name: ${name}, Email: ${email}, Msg: ${message}`);

      let emailSent = false;
      let errorMsg = "";

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const mailOptions = {
            from: `"${name || "User"}" <${smtpUser}>`,
            replyTo: email,
            to: "lachuoreilly@gmail.com",
            subject: `Diabetes Companion - Feedback: [${category || "Feedback"}]`,
            text: `Feedback received from:
Name: ${name || "Anonymous"}
Email: ${email}
Category: ${category || "General"}
Rating: ${rating ? rating + " / 5" : "N/A"}

Message:
${message}
`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1d4ed8; border-bottom: 2px solid #eff6ff; padding-bottom: 10px; margin-top: 0;">New Site Feedback</h2>
                <p>You have received new feedback from <strong>Diabetes Companion</strong>.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background: #f8fafc;">
                    <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0; width: 30%;">Name</td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${name || "Anonymous"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Email</td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
                  </tr>
                  <tr style="background: #f8fafc;">
                    <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Category</td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; font-weight: 800; color: #1d4ed8;">${category || "Feedback"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Rating</td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #eab308;">${rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "N/A"}</td>
                  </tr>
                </table>

                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 15px; white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #334155;">
${message}
                </div>
                
                <div style="font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; text-align: center;">
                  This is an automated notification from your Diabetes Companion application.
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          emailSent = true;
          console.log("Email sent successfully to lachuoreilly@gmail.com");
        } catch (emailErr: any) {
          console.error("Error sending email via SMTP:", emailErr);
          errorMsg = emailErr?.message || "SMTP transmission failed";
        }
      } else {
        console.warn("SMTP credentials not configured. Using fallback console log and simulation.");
        errorMsg = "SMTP credentials missing in environmental variables";
      }

      res.json({
        success: true,
        emailSent,
        message: emailSent 
          ? "Feedback email sent successfully." 
          : "Feedback received! (Logged securely on the server; configure SMTP_USER/SMTP_PASS in env variables to send real emails)",
        error: errorMsg || undefined
      });
    } catch (err: any) {
      console.error("Error processing feedback API call:", err);
      res.status(500).json({ error: err?.message || "Internal server error during feedback processing" });
    }
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
      const { assessment, age, equipment, glucoseLogs, completedSessions, mealLogs } = req.body;
      const data = await geminiService.getPersonalizedExercisePlans(assessment, age, equipment, glucoseLogs, completedSessions, mealLogs);
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

  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt, imageSize, aspectRatio } = req.body;
      const data = await geminiService.generateImage(prompt, imageSize, aspectRatio);
      res.json(data);
    } catch (err: any) {
      console.error("Error in generate-image:", err);
      res.status(500).json({ error: err?.message || "Failed to generate image" });
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
