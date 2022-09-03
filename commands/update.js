const child = require('child_process');
const pm2 = require('pm2');
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
        message.reply("Bot updated!");
        pm2.restart('../index.js');
        });
      message.delete().catch();
    }
  },
};
