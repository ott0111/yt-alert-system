import { SlashCommandBuilder } from "discord.js";
import { getDb } from "../utils/db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("addchannel")
    .setDescription("Add a YouTube channel to the tracking list")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("YouTube channel name")
        .setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString("name");

    const db = getDb();

    await db.query(
      "INSERT INTO channels (youtube_channel_id, youtube_channel_name) VALUES ($1, $2)",
      [name, name] // temporary — watcher resolves real ID
    );

    await interaction.reply({
      content: `📡 Added **${name}** to the tracking list.`,
      ephemeral: true
    });
  }
};
