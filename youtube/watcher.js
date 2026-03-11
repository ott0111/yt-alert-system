import { getDb } from "../utils/db.js";
import { searchChannelByName, getLatestVideo } from "./youtube.js";
import { logInfo, logError } from "../utils/logger.js";
import { Client } from "discord.js";

const client = new Client({ intents: [] });
client.login(process.env.DISCORD_TOKEN);

const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID;
const PING_ROLE_ID = process.env.PING_ROLE_ID;

async function resolveChannelIds() {
  const db = getDb();
  const result = await db.query("SELECT * FROM channels");

  for (const ch of result.rows) {
    if (ch.youtube_channel_id.length > 20) continue; // already resolved

    const resolved = await searchChannelByName(ch.youtube_channel_name);
    if (!resolved) continue;

    await db.query(
      "UPDATE channels SET youtube_channel_id = $1, youtube_channel_name = $2 WHERE id = $3",
      [resolved.id, resolved.title, ch.id]
    );

    logInfo(`Resolved channel: ${ch.youtube_channel_name} → ${resolved.title}`);
  }
}

async function checkUploads() {
  const db = getDb();
  const result = await db.query("SELECT * FROM channels");

  for (const ch of result.rows) {
    const latest = await getLatestVideo(ch.youtube_channel_id);
    if (!latest) continue;

    const exists = await db.query(
      "SELECT * FROM uploads WHERE video_id = $1",
      [latest.id]
    );

    if (exists.rows.length > 0) continue;

    await db.query(
      "INSERT INTO uploads (youtube_channel_id, video_id, video_title, published_at) VALUES ($1, $2, $3, $4)",
      [ch.youtube_channel_id, latest.id, latest.title, latest.publishedAt]
    );

    logInfo(`New upload detected: ${latest.title}`);

    const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
    if (channel) {
      channel.send(
        `<@&${PING_ROLE_ID}> 📢 **${ch.youtube_channel_name}** uploaded a new video!\nhttps://youtu.be/${latest.id}`
      );
    }
  }
}

async function startWatcher() {
  await resolveChannelIds();
  await checkUploads();

  setInterval(async () => {
    await resolveChannelIds();
    await checkUploads();
  }, 60000); // every 60 seconds
}

startWatcher();
