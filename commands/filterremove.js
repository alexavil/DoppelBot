const fs = require("fs");
module.exports = {
  name: "filterremove",
  description: "Manage filter",
  userpermissions: "ADMINISTRATOR",
  execute(message, args) {
    let id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./filter/" + id + ".json"));
    console.log(guildconf);
    if (!args.length) {
      return message.reply("Provide at least one banned word or string!");
    }
    if (args.length === 1) {
      let oldfilter = JSON.parse(fs.readFileSync("./filter/" + id + ".json"));
      console.log(oldfilter);
      if (!oldfilter.banned_words.includes(args[0])) {
        return message.reply("This word doesn't exist!");
      }
      let index = oldfilter.banned_words.indexOf(args[0]);
      let newfilter = oldfilter.banned_words.splice(index, 1);
      console.log(newfilter);
      let data = JSON.stringify(oldfilter);
      fs.writeFileSync("./filter/" + id + ".json", data, (err) => {
        if (err) {
          throw err;
        } else {
          console.log("item written successfully.");
        }
      });
      return message.reply("Removed!");
    }
    if (args.length > 1) {
      args.forEach((item) => {
        let oldfilter = JSON.parse(fs.readFileSync("./filter/" + id + ".json"));
        console.log(oldfilter);
        if (!oldfilter.banned_words.includes(item)) {
          return console.log("This word doesn't exist!");
        }
        let index = oldfilter.banned_words.indexOf(item);
        let newfilter = oldfilter.banned_words.splice(index, 1);
        console.log(newfilter);
        let data = JSON.stringify(oldfilter);
        fs.writeFileSync("./filter/" + id + ".json", data, (err) => {
          if (err) {
            throw err;
          } else {
            console.log("item written successfully.");
          }
        });
      });
      return message.reply("Removed!");
    }
  },
};
