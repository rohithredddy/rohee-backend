import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadUserData } from "./rag/loadDocs.js";
import { getChatResponse } from "./rag/chat.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "https://rohithredddy.vercel.app", // your deployed portfolio
      "http://localhost:5173",           // local dev testing
    ],
    credentials: true,
  })
);
app.use(express.json());

// ✅ Root Route — sanity check
app.get("/", (req, res) => {
  res.send("✅ Rohee backend is live and running on Render!");
});

// ✅ Health check route
app.get("/ping", (_req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// ✅ Data preview route (optional)
app.get("/test-data", (_req, res) => {
  try {
    const data = loadUserData();
    res.type("text/plain").send(data);
  } catch (err) {
    console.error("Error loading test data:", err);
    res.status(500).send("Error loading data.");
  }
});

// ✅ Main Chat route
app.post("/chat", async (req, res) => {
  const { question } = req.body;

  // Validate request
  if (!question || typeof question !== "string") {
    return res.status(400).json({ answer: "⚠️ Invalid or missing question." });
  }

  try {
    // Get AI response from your RAG or model
    const answer = await getChatResponse(question);

    if (!answer) {
      return res.status(200).json({
        answer: "🤖 I'm not sure how to respond to that right now.",
      });
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error generating response:", error.message || error);
    res.status(500).json({
      answer:
        "⚠️ Sorry, something went wrong on the server. Please try again later.",
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Rohee backend running on → http://localhost:${PORT}`)
);
