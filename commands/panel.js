const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
} = require("@discordjs/builders");
const { ButtonStyle, TextInputStyle, Colors } = require("discord.js");
const config = require("../config/config.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("🎟️ Create a panel to create tickets on (required)")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to create the panel on")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("customize")
        .setDescription("Whether you want to customize the panel or not")
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    if (!interaction.options.getBoolean("customize")) {
      const embed = new EmbedBuilder()
        .setTitle(config.tickets.embed.title)
        .setDescription("React to this message to create a ticket")
        .setColor(Colors.Green)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create-ticket")
          .setLabel("Create Ticket")
          .setEmoji({ name: "🎟️" })
          .setStyle(ButtonStyle.Primary)
      );

      channel.send({ embeds: [embed], components: [row] });

      interaction.reply({
        content: "Ticket panel created!",
        ephemeral: true,
      });
    } else {
      const modal = new ModalBuilder()
        .setCustomId("ticket-panel-modal")
        .setTitle("🎟️ Ticket Panel Creation");

      const embedTitle = new TextInputBuilder()
        .setCustomId("embedTitle")
        .setLabel("The title of the embed")
        .setPlaceholder("Ticket Panel")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const embedDesc = new TextInputBuilder()
        .setCustomId("embedDesc")
        .setLabel("The description of the embed")
        .setPlaceholder("React to this message to create a ticket")
        .setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(embedTitle);
      const secondActionRow = new ActionRowBuilder().addComponents(embedDesc);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
      await interaction.showModal(modal);
      console.log("Interaction user id:", interaction.user.id);

      const submit = await interaction.awaitModalSubmit({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      });

      if (submit) {
        const embed = new EmbedBuilder()
          .setTitle(submit.fields.components[0].components[0].value)
          .setDescription(submit.fields.components[1].components[0].value || "")
          .setColor(Colors.Green)
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("create-ticket")
            .setLabel("Create Ticket")
            .setEmoji({ name: "🎟️" })
            .setStyle(ButtonStyle.Primary)
        );

        channel.send({ embeds: [embed], components: [row] });

        submit.reply({
          content: "Ticket panel created!",
          ephemeral: true,
        });
      }
    }
  },
};
