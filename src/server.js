import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadUserData } from "./rag/loadDocs.js";
import { getChatResponse } from "./rag/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("✅ Rohee backend is live and running on Render!");
});

app.get("/ping", (_req, res) =>
  res.json({ message: "Backend is running ✅" })
);

app.get("/test-data", (_req, res) => {
  res.type("text/plain").send(loadUserData());
});

app.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ answer: "No question provided" });

  const answer = await getChatResponse(question);
  res.json({ answer });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running → http://localhost:${PORT}`));
