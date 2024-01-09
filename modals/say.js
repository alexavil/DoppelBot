const debug = process.env.DEBUG;
export default {
  name: "say",
  execute(interaction) {
    let chl = interaction.fields.getTextInputValue("channelInput");
    let msg = interaction.fields.getTextInputValue("responseInput");
    if (chl) {
      if (debug === "true")
        console.log(`[DEBUG] Sending dev-generated message to ${chl}...`);
      interaction.client.channels.cache.get(chl).send(msg);
      interaction.reply({content: "Success!", ephemeral: true});
    } else {
      if (debug === "true")
        console.log(
          `[DEBUG] Sending dev-generated message to ${interaction.channel.id}...`
        );
      interaction.channel.send(msg);
      interaction.reply({content: "Success!", ephemeral: true});
    }
  },
};
