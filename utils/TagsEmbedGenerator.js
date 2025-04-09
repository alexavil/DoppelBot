import Discord from "discord.js";

export const generateTagsEmbed = (options, page = 1, interaction) => {
  let start = 25 * (page - 1);
  let values = [];
  let i;
  let tagsembed = new Discord.EmbedBuilder().setTitle(
      `Tags for ${interaction.guild.name}`,
  );

  for (i = start; i < start + 25 && i < options.length; i++) {
    let option = options[i];
    let field = {
      name: `${option.tag}`,
      value: `${option.response.replace("\n---\n", "\n")}`,
    }
    values.push(field);
  }

  tagsembed.addFields(values);

  const addtag = new Discord.ButtonBuilder()
    .setCustomId(`tagcreate`)
    .setLabel(`Create a tag`)
    .setStyle(Discord.ButtonStyle.Primary);
  const deltag = new Discord.ButtonBuilder()
    .setCustomId(`tagdelete`)
    .setLabel(`Delete tags`)
    .setStyle(Discord.ButtonStyle.Danger);
  const deftag = new Discord.ButtonBuilder()
    .setCustomId(`tagdefaults`)
    .setLabel(`Clear all tags`)
    .setStyle(Discord.ButtonStyle.Danger);
  const previous_page = new Discord.ButtonBuilder()
    .setCustomId(`tags_prev`)
    .setLabel(`<= Previous`)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(page === 1);
  const next_page = new Discord.ButtonBuilder()
    .setCustomId(`tags_next`)
    .setLabel(`Next =>`)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(start + 25 >= options.length);
  const row = new Discord.ActionRowBuilder().addComponents(addtag, deltag, deftag);

  let row2;
  if (options.length > 25) {
    row2 = new Discord.ActionRowBuilder().addComponents(
      previous_page,
      next_page,
    );
    return {
      embeds: [tagsembed],
      components: [row2, row],
      flags: Discord.MessageFlags.Ephemeral,
    };
  } else {
    return {
      embeds: [tagsembed],
      components: [row],
      flags: Discord.MessageFlags.Ephemeral,
    };
  }


};
