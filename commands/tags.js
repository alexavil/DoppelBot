const sqlite3 = require("better-sqlite3");

const tags = new sqlite3("./data/tags.db");

module.exports = {
    name: "tags",
    description: "Tags control",
    aliases: ["t"],
    async execute(message, args) {
        const id = message.guild.id;
        if (args.length === 0) {
            return message.reply("Provide a command!");
        }

        switch(args[0]) {
            case "create":
            case "c": {
                let keyword = undefined;
                let response = undefined;
                const filter = m => m.author.id == message.author.id;

                message.channel.send("Please provide a key word or phrase or type `cancel` to cancel.");
                let keyword_collector = message.channel.createMessageCollector({ filter, max: 1 });
                keyword_collector.on('collect', m => {
                    switch (m.content) {
                        case "cancel":
                            return message.channel.send("Cancelled!");
                        default:
                            keyword = m.content;
                            let tag = tags
                                .prepare(`SELECT * FROM guild_${id} WHERE tag = ?`)
                                .get(keyword);
                            if (tag !== undefined) return message.channel.send("A tag with that key word already exists!"); 
                            message.channel.send("Please provide the response or type `cancel` to cancel.");
                            let response_collector = message.channel.createMessageCollector({ filter, max: 1 });
                            response_collector.on('collect', m => {
                                switch (m.content) {
                                    case "cancel":
                                        return message.channel.send("Cancelled!");
                                    default:
                                        response = m.content;
                                        tags
                                        .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
                                        .run(keyword, response);
                                        return message.channel.send("Tag created successfully!");
                                }
                            });   
                    }
                });
            }

            case "delete":
            case "d": {
                    
            }
        }
    }
}