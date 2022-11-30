const Discord = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "togglefilter",
  aliases: ["filter"],
  description: "Toggle filter",
  userpermissions: "BAN_MEMBERS",
  execute(message) {
    id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./guilds/" + id + ".json"));
    console.log(guildconf);
    if (guildconf.filter == "inactive") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", (fd) => {
        stream.write("{\n");
        stream.write(`"aa": "` + guildconf.aa + `",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "` + guildconf.other + `",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "active",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Filter is now **on**!");
    }
    if (guildconf.filter == "active") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", (fd) => {
        stream.write("{\n");
        stream.write(`"aa": "` + guildconf.aa + `",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "` + guildconf.other + `",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "inactive",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Filter is now **off**!");
    }
  },
};
