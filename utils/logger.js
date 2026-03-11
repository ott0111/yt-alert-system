import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logsDir, "bot.log");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function write(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
  fs.appendFile(logFile, line, () => {});
  console.log(line.trim());
}

export function logInfo(msg) {
  write("INFO", msg);
}

export function logError(msg) {
  write("ERROR", msg);
}
