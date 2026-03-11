import fetch from "node-fetch";
import { logError } from "../utils/logger.js";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function searchChannelByName(name) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
      name
    )}&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const channel = data.items[0];

    return {
      id: channel.id.channelId,
      title: channel.snippet.title
    };
  } catch (err) {
    logError("YouTube search error: " + err.message);
    return null;
  }
}

export async function getLatestVideo(channelId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const video = data.items[0];

    return {
      id: video.id.videoId,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt
    };
  } catch (err) {
    logError("YouTube latest video error: " + err.message);
    return null;
  }
}
