client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "close-ticket") {
      const { EmbedBuilder } = require("@discordjs/builders");
      const { AttachmentBuilder, Colors } = require("discord.js");
      const channel = interaction.channel;
      const closer = interaction.user;
      const ticketOwner = channel.topic;
      console.log(ticketOwner);
      const config = require("../config/config.json");
      const db = require("../database/database").getDatabase();

      const profile = db
        .prepare("SELECT * FROM profiles WHERE id = ?")
        .get(ticketOwner);

      if (!profile) {
        db.prepare("INSERT INTO profiles (id) VALUES (?)").run(ticketOwner);
      }

      const totalTickets = profile?.totalTickets ? profile?.totalTickets : 0;
      db.prepare("UPDATE profiles SET totalTickets = ? WHERE id = ?").run(
        totalTickets + 1,
        ticketOwner
      );

      const openTickets = profile?.ticketsOpen ? profile?.ticketsOpen : 0;
      db.prepare("UPDATE profiles SET ticketsOpen = ? WHERE id = ?").run(
        openTickets > 0 ? openTickets - 1 : 0,
        ticketOwner
      );

      if (config.tickets.logs) {
        const logs = client.channels.cache.get(config.tickets.logs);

        const embed = new EmbedBuilder()
          .setAuthor({
            name: closer.tag,
            iconURL: closer.displayAvatarURL(),
          })
          .setTitle(config.tickets.embed.title)
          .setColor(Colors.Green)
          .addFields({
            name: "Ticket Owner",
            value: `<@${ticketOwner}>`,
            inline: true,
          })
          .setTimestamp();

        let ticketLog = `**Start of transcript - #${interaction.channel.name}**`;

        await interaction.channel.messages
          .fetch({ limit: 100 })
          .then(async (messages) => {
            let finalMessages = messages.reverse();
            for (const [key, value] of finalMessages) {
              ticketLog += `\r\n\r\n[${new Date(value.createdAt).toLocaleString(
                "en-US",
                { timeZone: "UTC" }
              )} UTC] ${value.author?.tag ?? "Unknown"}`;
              ticketLog += `: ${value.content || "- Embed"}`;
            }
          });

        ticketLog += `\n\n**End of transcript - #${interaction.channel.name}**`;

        const buffer = Buffer.from(ticketLog, "utf-8");
        const transcript = new AttachmentBuilder(buffer, {
          name: `ticket-${ticketOwner}.txt`,
        });

        logs.send({ embeds: [embed], files: [transcript] });
      }

      const staff = db
        .prepare("SELECT * FROM staff WHERE id = ?")
        .get(interaction.user.id);

      if (!staff) {
        db.prepare("INSERT INTO staff (id) VALUES (?)").run(
          interaction.user.id
        );
      }

      const ticketsClosed = staff?.ticketsClosed ? staff?.ticketsClosed : 0;
      db.prepare("UPDATE staff SET ticketsClosed = ? WHERE id = ?").run(
        ticketsClosed + 1,
        interaction.user.id
      );

      channel.delete();
    }
  }
});
