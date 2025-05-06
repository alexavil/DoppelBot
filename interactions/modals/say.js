import debugLog from "../../utils/DebugHandler.js";
import Discord from "discord.js";

export default {
  name: "say",
  execute(interaction) {
    let chl = interaction.fields.getTextInputValue("channelInput");
    let msg = interaction.fields.getTextInputValue("responseInput");
    if (chl) {
      
        debugLog(`Sending dev-generated message to ${chl}...`);
      interaction.client.channels.cache.get(chl).send(msg);
      interaction.reply({
        content: "Success!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    } else {
      
        debugLog(
          `Sending dev-generated message to ${interaction.channel.id}...`,
        );
      interaction.channel.send(msg);
      interaction.reply({
        content: "Success!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
