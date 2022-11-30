const fs = require("fs");
module.exports = {
  name: "toggleaa",
  aliases: ["aa"],
  description: "Toggle Ace Attorney images",
  userpermissions: "BAN_MEMBERS",
  execute(message) {
    let id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./guilds/" + id + ".json"));
    console.log(guildconf);
    if (guildconf.aa == "inactive") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", () => {
        stream.write("{\n");
        stream.write(`"aa": "active",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "` + guildconf.other + `",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "` + guildconf.filter + `",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Ace Attorney responses are now **on**!");
    }
    if (guildconf.aa == "active") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", () => {
        stream.write("{\n");
        stream.write(`"aa": "inactive",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "` + guildconf.other + `",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "` + guildconf.filter + `",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Ace Attorney responses are now **off**!");
    }
  },
};
