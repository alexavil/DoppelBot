# DoppelBot

A multi-purpose Discord bot for entertainment.

We encourage the bot to be self-hosted. Please follow this guide to install the bot.

### Installation

1. [Create a new Discord application and copy the bot's token.](https://discord.com/developers/applications/)
2. Install the latest version of Node.js and npm.

The best way to do so is to execute the following commands (powered by Nodesource):
```
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

3. Clone this repository.

```
git clone https://github.com/alexavil/DoppelBot.git
```

4. `cd` to the directory, for example `cd DoppelBot`.
5. Install all dependencies via `npm install`.
6. Copy the contents of `empty.env` to a `.env` file and fill in the options.
7. (Optional) Install `pm2` by typing `npm install -g pm2`.
8. Launch the `index.js` file.

Without `pm2`:
```
node ./index.js
```

With `pm2`:
```
pm2 start ./index.js
```
