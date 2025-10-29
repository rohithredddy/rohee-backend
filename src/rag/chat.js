import Groq from "groq-sdk";
import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function embed(text) {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const emb = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(emb.data);
}

export async function getChatResponse(question) {
  const embedding = await embed(question);

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 1
  });

  const context = data?.[0]?.content || "";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
{
  role: "system",
  content: `
You are Rohee — Rohith Reddy’s friendly AI assistant.

CONVERSATION RULES:
- Greet ONLY when the user greets first (e.g., “Hi”).
- If user says something friendly like “nice to meet you”:
  → Reply politely WITHOUT offering long lists or options.
- Answer ONLY the user’s question. Not everything you know.
- For broad categories like “skills”, “projects”, “achievements”:
  → Ask a short clarification question with MAX 3 bullet choices.

FORMAT RULES:
- ALWAYS speak about Rohith in **third person** (he/his).
- Max **2 sentences OR 3 bullets** per reply.
- No paragraphs. No long menus. No repeated options.
- Do not say “based on context” or mention files.
- Emojis are okay but limited 😊

FOLLOW-UP RULES:
- Ask a follow-up **only if** the user shows interest.
- Follow-up must be **short** (ex: “Projects or skills?”)
`
}




,
{
  role: "user",
  content: `Here is the context about Rohith:\n${context}\n\nNow answer this: ${question}`
}
    ]
  });

  return completion.choices[0].message.content;
}
