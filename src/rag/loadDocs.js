import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");

export function loadUserData() {
  try {
    const files = fs.readdirSync(dataDir);
    let result = "";

    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), "utf8");
      result += `\n===== ${file} =====\n${content}\n`;
    }

    return result;
  } catch (err) {
    return `❌ Error loading data: ${err}`;
  }
}
