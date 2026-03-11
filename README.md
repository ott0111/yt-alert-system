# YT Alert System

A Discord bot + dashboard that tracks YouTube channels and sends alerts when new videos are uploaded.

## Features
- Slash command: /addchannel <name>
- Multi-channel YouTube watcher
- Discord OAuth dashboard
- Purple dark-mode Tailwind UI
- PostgreSQL storage (Railway)
- Logging system

## Tech Stack
- Node.js
- Express
- Discord.js
- PostgreSQL
- Railway hosting

## Deployment
1. Push this repo to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy

## Environment Variables
- DISCORD_TOKEN
- DISCORD_CLIENT_ID
- DISCORD_CLIENT_SECRET
- DISCORD_REDIRECT_URI
- DISCORD_GUILD_ID
- POSTGRES_URL
- YOUTUBE_API_KEY
- PING_ROLE_ID
- ALERT_CHANNEL_ID
