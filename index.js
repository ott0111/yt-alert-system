import "dotenv/config";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import { createServer } from "./dashboard/server.js";
import { initDb } from "./utils/db.js";
import { logInfo, logError } from "./utils/logger.js";
import "./youtube/watcher.js"; // will hook into client later
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV
const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load commands from ./commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = (await import(filePath)).default;
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  logInfo(`Logged in as ${client.user.tag}`);

  // Init DB
  await initDb();

  // Start dashboard server
  createServer(client);

  logInfo("Dashboard server started.");
});

// Handle interactions (slash commands)
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logError(`Error executing command ${interaction.commandName}: ${error.message}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "There was an error executing this command.", ephemeral: true });
    } else {
      await interaction.reply({ content: "There was an error executing this command.", ephemeral: true });
    }
  }
});

client.login(DISCORD_TOKEN);
