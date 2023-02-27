module.exports = {
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
        console.log(message.attachments);
        message.attachments.forEach((att) => {
          let url = att.url;
          attachments.push(url);
          console.log(attachments);
        });
      }
      if (chl) {
        let msg = args.slice(1).join(" ");
        chl.send(msg, {
          files: attachments,
        });
      } else {
        let msg = args.join(" ");
        message.channel.send(msg, {
          files: attachments,
        });
      }
      message.delete().catch();
    }
  },
};
