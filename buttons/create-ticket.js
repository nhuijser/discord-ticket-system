client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "create-ticket") {
      const discord = require("discord.js");
      const {
        EmbedBuilder,
        ActionRowBuilder,
        ButtonBuilder,
        ModalBuilder,
        TextInputBuilder,
      } = require("@discordjs/builders");

      const config = require("../config/config.json");
      const db = require("../database/database").getDatabase();

      const profile = db
        .prepare("SELECT * FROM profiles WHERE id = ?")
        .get(interaction.user.id);

      if (!profile) {
        db.prepare("INSERT INTO profiles (id) VALUES (?)").run(
          interaction.user.id
        );
      }

      const ticketsOpen = profile?.ticketsOpen ? profile?.ticketsOpen : 0;

      if (ticketsOpen >= config.tickets.max) {
        interaction.reply({
          content: "You have too many tickets open!",
          ephemeral: true,
        });
        return;
      }

      const guild = client.guilds.cache.get(config.guild.id);
      const category = guild.channels.cache.get(config.guild.category);

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        topic: `${interaction.user.id}`,
        type: discord.ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [discord.PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              discord.PermissionFlagsBits.ViewChannel,
              discord.PermissionFlagsBits.SendMessages,
              discord.PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(config.tickets.embed.title)
        .setDescription(config.tickets.embed.open.description)
        .setColor(discord.Colors.Green)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close-ticket")
          .setLabel("Close Ticket")
          .setEmoji({ name: "🔒" })
          .setStyle(discord.ButtonStyle.Danger)
      );

      channel.send({ embeds: [embed], components: [row] });

      const modal = new ModalBuilder()
        .setCustomId("ticket-creation-modal")
        .setTitle("🎟️ Ticket Creation");

      const issue = new TextInputBuilder()
        .setCustomId("issue")
        .setLabel("Issue")
        .setPlaceholder("I have trouble doing...")
        .setMinLength(1)
        .setMaxLength(256)
        .setStyle(discord.TextInputStyle.Paragraph)
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder().addComponents(issue);

      modal.addComponents(firstActionRow);
      try {
        await interaction.showModal(modal);
      } catch (e) {
        console.log(e);
      }

      const submit = await interaction.awaitModalSubmit({
        time: 128000,
        filter: (i) => i.user.id === interaction.user.id,
      });

      let issueText = "";
      if (submit) {
        issueText = await submit.fields.components[0].components[0].value;
        submit.reply({
          content: "Ticket created!",
          ephemeral: true,
        });
      }

      const issueEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields({
          name: "Issue",
          value: issueText,
        })

        .setColor(discord.Colors.Green)
        .setTimestamp();

      channel.send({ embeds: [issueEmbed] });

      db.prepare("UPDATE profiles SET ticketsOpen = ? WHERE id = ?").run(
        ticketsOpen + 1,
        interaction.user.id
      );
    }
  }
});
