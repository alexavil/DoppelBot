import Discord from "discord.js";

export const generateMenu = (options, page = 1) => {
  let start = 25 * (page - 1);
  let values = [];
  let i;

  for (i = start; i < start + 25 && i < options.length; i++) {
    let option = options[i];
    let menuOption = new Discord.StringSelectMenuOptionBuilder()
      .setLabel(option.name)
      .setValue(option.filename);
    values.push(menuOption);
  }

  const menu = new Discord.StringSelectMenuBuilder()
    .setCustomId(`selectlocal`)
    .setOptions(values)
    .setMinValues(1)
    .setMaxValues(values.length);
  const previous_page = new Discord.ButtonBuilder()
    .setCustomId(`music_prev`)
    .setLabel(`<= Previous`)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(page === 1);
  const next_page = new Discord.ButtonBuilder()
    .setCustomId(`music_next`)
    .setLabel(`Next =>`)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(start + 25 >= options.length);
  const cancel = new Discord.ButtonBuilder()
    .setCustomId(`music_cancel`)
    .setLabel(`Cancel`)
    .setStyle(Discord.ButtonStyle.Secondary);
  const row = new Discord.ActionRowBuilder().addComponents(menu);

  let row2;
  if (options.length > 25) {
    row2 = new Discord.ActionRowBuilder().addComponents(
      previous_page,
      next_page,
      cancel,
    );
  } else {
    row2 = new Discord.ActionRowBuilder().addComponents(cancel);
  }

  return {
    content: `Select track(s) to play (tracks ${start + 1} - ${i})`,
    components: [row, row2],
    flags: Discord.MessageFlags.Ephemeral,
  };
};
