const debug = process.env.DEBUG;
export default {
  name: "say",
  description: "Make the bot say something!",
  execute(message, args) {
    if (
      message.author.id === "332148103803174913" ||
      message.author.id === "788097137124442122"
    ) {
      let chl = message.mentions.channels.first();
      let attachments = [];
      if (message.attachments) {
        message.attachments.forEach((att) => {
          let url = att.url;
          attachments.push(url);
        });
      }
      if (chl) {
        if (debug === "true")
          console.log(`[DEBUG] Sending dev-generated message to ${chl.id}...`);
        let msg = args.slice(1).join(" ");
        chl.send(msg, {
          files: attachments,
        });
      } else {
        if (debug === "true")
          console.log(
            `[DEBUG] Sending dev-generated message to ${message.channel.id}...`,
          );
        let msg = args.join(" ");
        message.channel.send(msg, {
          files: attachments,
        });
      }
      message.delete().catch();
    }
  },
};
