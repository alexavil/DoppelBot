const child = require('child_process');
module.exports = {
  name: "update",
  description: "Update the bot",
  execute(message, args) {
    if (
      message.author.id === "332148103803174913" ||
      message.author.id === "788097137124442122"
    ) {
      child.exec('./scripts/update.sh', (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return message.reply("Error updating the bot!");
        }
        console.log(stdout);
        child.exec('chmod 777 ./scripts/update.sh');
        return message.reply("Bot updated! Restart the Docker container to apply the changes.");
        });
      message.delete().catch();
    }
  },
};
