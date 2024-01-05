const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const { Colors } = require("discord.js");
const config = require("../config/config.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("🎟️ Check your ticketing stats!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("A staff member you want to see the statistics of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const db = require("../database/database").getDatabase();

    const profile = db.prepare("SELECT * FROM staff WHERE id = ?").get(user.id);

    if (!profile) {
      db.prepare("INSERT INTO staff (id) VALUES (?)").run(user.id);
    }

    const closedTickets = profile?.ticketsClosed ? profile?.ticketsClosed : 0;

    const embed = new EmbedBuilder()
      .setTitle("🎟️ Ticketing Statistics")
      .setDescription(
        user === interaction.user
          ? "You" + " have closed **" + closedTickets + "** ticket(s)!"
          : "They" + " have closed **" + closedTickets + "** ticket(s)!"
      )
      .setColor(Colors.Green)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
