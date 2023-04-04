# DoppelBot

A general-purpose Discord bot for entertainment.

We encourage the bot to be self-hosted. Please follow this guide to install the bot.

### Basic Installation

1. Create a new Discord application and copy the bot's token.
2. Install the latest version of Node.js and npm.
3. Clone this repository.
4. `cd` to the directory, for example `cd DoppelBot`.
5. Install all dependencies via `npm install`.
6. Launch the `index.js` file, providing the token as an argument.

For example:
```
node ./index.js "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Installation with pm2

1. Create a new Discord application and copy the bot's token.
2. Install the latest version of Node.js and npm.
3. Install the latest version of `pm2`: `npm install -g pm2`.
4. Clone this repository.
5. `cd` to the directory, for example `cd DoppelBot`.
6. Install all dependencies via `npm install`.
7. Launch the `index.js` file, providing the token as an argument.

For example:
```
pm2 start ./index.js -- "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```
