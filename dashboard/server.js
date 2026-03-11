import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { authRouter, requireAuth } from "./auth.js";
import { getDb } from "../utils/db.js";
import { logInfo } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer(client) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: "super-secret-session-key",
      resave: false,
      saveUninitialized: false
    })
  );

  // OAuth routes
  app.use("/auth", authRouter);

  // Static files
  app.use(
    "/public",
    express.static(path.join(__dirname, "public"))
  );

  // Dashboard view
  app.get("/", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });

  // API: Get channels
  app.get("/api/channels", requireAuth, async (req, res) => {
    const db = getDb();
    const result = await db.query("SELECT * FROM channels ORDER BY id DESC");
    res.json(result.rows);
  });

  // API: Add channel
  app.post("/api/channels", requireAuth, async (req, res) => {
    const { youtube_channel_id, youtube_channel_name } = req.body;

    if (!youtube_channel_id || !youtube_channel_name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const db = getDb();
    await db.query(
      "INSERT INTO channels (youtube_channel_id, youtube_channel_name) VALUES ($1, $2)",
      [youtube_channel_id, youtube_channel_name]
    );

    res.json({ success: true });
  });

  // API: Delete channel
  app.delete("/api/channels/:id", requireAuth, async (req, res) => {
    const db = getDb();
    await db.query("DELETE FROM channels WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  });

  // API: Logs
  app.get("/api/logs", requireAuth, (req, res) => {
    const logPath = path.join(__dirname, "..", "logs", "bot.log");
    res.sendFile(logPath);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logInfo(`Dashboard running on port ${PORT}`));
}
