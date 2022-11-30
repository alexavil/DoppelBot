const fs = require("fs");
module.exports = {
  name: "toggleother",
  description: "Toggle other responses",
  aliases: ["other"],
  userpermissions: "BAN_MEMBERS",
  execute(message) {
    let id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./guilds/" + id + ".json"));
    console.log(guildconf);
    if (guildconf.other == "inactive") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", () => {
        stream.write("{\n");
        stream.write(`"aa": "` + guildconf.aa + `",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "active",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "` + guildconf.filter + `",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Other responses are now **on**!");
    }
    if (guildconf.other == "active") {
      let stream = fs.createWriteStream("./guilds/" + id + ".json");
      stream.once("open", () => {
        stream.write("{\n");
        stream.write(`"aa": "` + guildconf.aa + `",\n`);
        stream.write(`"mentions": "` + guildconf.mentions + `",\n`);
        stream.write(`"other": "inactive",\n`);
        stream.write(`"prefix": "` + guildconf.prefix + `",\n`);
        stream.write(`"filter": "` + guildconf.filter + `",\n`);
        stream.write(`"global_bans": "` + guildconf.global_bans + `"\n`);
        stream.write("}");
        stream.end();
      });
      message.reply("Other responses are now **off**!");
    }
  },
};
