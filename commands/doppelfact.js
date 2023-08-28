const fs = require("fs");
const event = require("../index");
module.exports = {
  name: "doppelfact",
  description: "Get a random Doppel fact",
  execute(message) {
    if (event.eventcode !== 3) return;
    const responses = JSON.parse(fs.readFileSync("./event/doppel_bday/facts.json"));

    const facts = responses.facts;

    message.channel.send(facts[Math.floor(Math.random() * facts.length)]);
  },
};
