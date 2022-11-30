const fs = require("fs");
module.exports = {
  name: "spelldesc",
  description: "Spell descriptions",
  execute(message) {
    const responses = JSON.parse(fs.readFileSync("./responses.json"));
    message.delete().catch();

    const spells = responses.spells;

    message.channel.send(spells[Math.floor(Math.random() * spells.length)]);
  },
};
