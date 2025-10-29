import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";
import { loadUserData } from "./loadDocs.js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function generateEmbeddings() {
  console.log("📚 Loading personal data...");
  const text = loadUserData();

  console.log("🧠 Loading MiniLM model...");
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  console.log("✨ Creating embedding...");
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data);

  console.log("⬆️ Uploading...");
  const { error } = await supabase
    .from("documents")
    .insert({ content: text, embedding });

  if (error) console.error("❌ Supabase error:", error);
  else console.log("✅ Embedding stored successfully!");
}

generateEmbeddings();
