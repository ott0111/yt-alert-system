import Parser from "rss-parser";
import { getDb } from "../utils/db.js";
import { logInfo, logError } from "../utils/logger.js";
import { Client } from "discord.js";

const client = new Client({ intents: [] });
client.login(process.env.DISCORD_TOKEN);

const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID;
const PING_ROLE_ID = process.env.PING_ROLE_ID;

// Your channel ID (VoidEsports2x)
const CHANNEL_ID = "UC9V7H5P4pQGxv8u1w6p8Jx4A";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const parser = new Parser();

async function checkRSS() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    const latest = feed.items[0];

    if (!latest) return;

    const videoId = latest.id.replace("yt:video:", "");
    const title = latest.title;
    const publishedAt = latest.pubDate;

    const db = getDb();

    // Check if already stored
    const exists = await db.query(
      "SELECT * FROM uploads WHERE video_id = $1",
      [videoId]
    );

    if (exists.rows.length > 0) return;

    // Store new upload
    await db.query(
      "INSERT INTO uploads (youtube_channel_id, video_id, video_title, published_at) VALUES ($1, $2, $3, $4)",
      [CHANNEL_ID, videoId, title, publishedAt]
    );

    logInfo(`New upload detected: ${title}`);

    // Send alert
    const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
    if (channel) {
      channel.send(
        `<@&${PING_ROLE_ID}> 📢 **VoidEsports2x** uploaded a new video!\nhttps://youtu.be/${videoId}`
      );
    }
  } catch (err) {
    logError("RSS watcher error: " + err.message);
  }
}

async function startWatcher() {
  logInfo("RSS watcher started for VoidEsports2x");
  await checkRSS();

  setInterval(checkRSS, 60000); // every 60 seconds
}

startWatcher();
