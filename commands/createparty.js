module.exports = {
  name: "createparty",
  description: "Create a party",
  execute(message) {
    function randomInt(min, max) {
      return min + Math.floor((max - min) * Math.random());
    }
    let id = randomInt(1, 999);
    let chname = "party-" + id.toString();
    let code = randomInt(1000, 9999);
    message.guild.channels.create(chname, {
      type: "text",
      topic: "Party code: " + code + ". Leader: " + message.author.tag,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ["VIEW_CHANNEL"],
        },
        {
          id: message.author.id,
          allow: ["VIEW_CHANNEL", "MANAGE_MESSAGES"],
        },
      ],
    });
    message.author
      .send("Your party (" + chname + ") code: " + code + ".")
      .catch((error) => {
        if (error.code === 50007) {
          console.error("Failed to send the message:", error);
          return message.author.send(
            "I could not send you the code. Look it up in your new channel topic."
          );
        }
      });
    message.delete();
  },
};
