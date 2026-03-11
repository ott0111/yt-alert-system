import express from "express";
import fetch from "node-fetch";
import { logInfo } from "../utils/logger.js";

export const authRouter = express.Router();

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  DISCORD_GUILD_ID
} = process.env;

export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

authRouter.get("/login", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;
  res.redirect(redirect);
});

authRouter.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const user = await userRes.json();

  // Get guilds
  const guildRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const guilds = await guildRes.json();

  const inGuild = guilds.some(g => g.id === DISCORD_GUILD_ID);

  if (!inGuild) {
    return res.send("You must be in the server to access this dashboard.");
  }

  req.session.user = user;
  logInfo(`Dashboard login: ${user.username}`);

  res.redirect("/");
});

authRouter.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});
