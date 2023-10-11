const fs = require("fs");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "doppelfact",
  description: "Get a random Doppel fact",
  execute(message) {
    let event = settings
      .prepare(`SELECT * FROM global WHERE option = 'event_code'`)
      .get().value;
    if (event !== 3) return;
    const responses = JSON.parse(fs.readFileSync("./event/doppel_bday/facts.json"));

    const facts = responses.facts;

    message.channel.send(facts[Math.floor(Math.random() * facts.length)]);
  },
};
