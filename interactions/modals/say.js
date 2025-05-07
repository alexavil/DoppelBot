import engine from "../../utils/Engine.js";
import Discord from "discord.js";

export default {
  name: "say",
  execute(interaction) {
    let chl = interaction.fields.getTextInputValue("channelInput");
    let msg = interaction.fields.getTextInputValue("responseInput");
    if (chl) {
      engine.debugLog(`Sending dev-generated message to ${chl}...`);
      interaction.client.channels.cache.get(chl).send(msg);
      interaction.reply({
        content: "Success!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    } else {
      engine.debugLog(`Sending dev-generated message to ${interaction.channel.id}...`);
      interaction.channel.send(msg);
      interaction.reply({
        content: "Success!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
