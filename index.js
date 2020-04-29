const fs = require('fs');
const Discord = require('discord.js');
const { Client, RichEmbed, Permissions, PermissionOverwrites, GuildMember, } = require('discord.js');
const config = require('./config.json')

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}


client.on('ready', () => {
  console.log('I am ready!')
client.user.setPresence({
    status: "online",
    game: {
        name: `Doppel: Become Human`,
        type: "PLAYING"
    },
});
function DailyDoppel() {
  const doppel_imgs = [
    'https://cdn.discordapp.com/attachments/694943149142966396/694943222882893924/1f6d3f69f297eb0cbbd4fa55b2eb39acd7ef64fe_full.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943225105874995/5f82f4034113f2759e9aed767bf8a20f.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943226683064380/13dd2f72488e4b74cbc4736378e7dad9.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943227282849833/5e8b7ab2-032f-42cd-a5b5-321813847b0c.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943230990745640/16eee208-27d3-4123-8334-675ab64647f6.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943235251896410/39eb5bdd-4051-49ac-974f-1f353104e758.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943241144893530/754a4977-ebf7-42b5-8784-86167f2d11c8.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943241304408084/59cb0b93-476c-44c3-8d6a-98758895763e.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943245402112060/1252ac67-c134-4b40-9755-55ca56433d87.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943248468279336/02291e16-369c-42fc-a99f-df1df30376c8.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943708055076945/2485cc11-45dc-4133-a5aa-45760be5f7b0.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943712559628369/9372f7b7-cd18-4fed-8333-2a67712c742e.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943715638116452/1086212i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943716716183643/24862a61-a92b-4e7b-a10f-6c0d9e2bd813.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943717831737424/1143719i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943717982732378/1626232i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943720138735656/2248953i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943722286350386/6424877i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943723980718190/6440424i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943728439132261/8071897i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943974968000592/16121356_p0_square1200.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943976171765760/45093982_p0_square1200.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943978335764500/471705293.2.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943982014169088/ab7a13b9-009b-40cc-b604-dc6068b24c1b.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943982157037568/bf5e2a75-784a-484e-bad7-678090a39aa9.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943991539564624/ce7ed27b-63d7-4de9-8f5c-6c1ed6b6698e.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943993007570944/db52ba7d-0d9b-4811-a89d-758be8ca0c16.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943993196183562/doppel13.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943995415232532/doppel11.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694943994878099516/doppel13.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944897337393222/doppel14.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944898087911534/Doppel4.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944904815575160/Doppel6.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944910381416448/Doppel7.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944917750939648/doppelganger_arle_puyopuyo_and_1_more_drawn_by_kawamochi_mocchii__28ae11906bc6d9105748216fb874f3f3.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944924138995732/doppelganger_arle_puyopuyo_and_1_more_drawn_by_tsukino_neru__2ba4718440e21be03fd26ba7bfec3e95.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944931659382824/doppelganger_arle_puyopuyo_and_1_more_drawn_by_zubon_no_onara__sample-18828f09a416042571183f81e46319.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944938441310219/doppellaying.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944946590842900/doppelonbreak.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694944954048315462/EN9wLmeWsAIGQ82.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945112936939610/fdc88299-f8d9-478b-983f-0f34a07ff2ef.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945116787572827/flat1000x1000075f.u2.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945121170489494/gigavoidhole.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945127184990278/image164560795l.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945180440068187/megavoidhole.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945190624100387/merryfuckingxmas.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945199855632414/picture_pc_79cfb9c4e9e99700dce5b6cabe560d94.jpg.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945207673684008/tumblr_d59c68b25c5698ed9d913ba51c5bf0d9_1c3d21bf_640.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945217853521950/twoarlestwice2.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945231258255360/twoarlestwice3.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945231258255360/twoarlestwice4.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/694945288695316551/Voidhole.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301267941228655/DoL8sKPUcAAb81x.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301272441454653/doppelpfp.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301273880100984/EQPqXovU8AA7XwY.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301415270219796/EUD9zxiUEAAgcaR.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301428662501497/ER7y9z4U0AAEC72.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301437202366484/re.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301442818277464/unnamed.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303582676942868/doppelganger_arle_puyopuyo_and_1_more_drawn_by_tsukino_neru__2ba4718440e21be03fd26ba7bfec3e95.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303583113150484/ESRFvYOU0AEjOJt.jpgsmall.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303584601866320/4838999i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303586006958190/2987601-tenLxHNjMEtMuAQN.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303586959196320/566.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303588813209611/c469.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695303589962448976/image158144862l.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301265969643561/DoCuhm5XoAAikZs.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301260848660590/C1f_IF_UQAADKX_.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301257664921691/C0bxbA5UQAQ0dle.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301255320436787/8625520i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301251566534746/1184609i.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/695301250308243516/45.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461223537803274/doppel.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461225752395826/doppel16.jpg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461236774895696/doppelsmirk.png',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461240310693928/ETtO5c8UMAAoemv.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461242793852948/EV_OBXbXkAcx-_G.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461245243457576/EWVP_PCUwAAixDP.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461245411229857/EVPQnKJUcAIcYCA.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461247566839808/doppel_puyo4.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704461248665747486/external-content.duckduckgo.com.jpeg',
    'https://cdn.discordapp.com/attachments/694943149142966396/704462085014159430/image0.png.jpeg',         
];
  const channel = client.channels.get('678640161738850365');
  channel.send("I hope you're having a great time! Here's your Daily Doppel! :heart:", {
  file: doppel_imgs[Math.floor(Math.random() * doppel_imgs.length)]
});
}
setInterval(DailyDoppel, 86400 * 1000);
});

client.on('message', message => {
  if (!message.content.startsWith(config.prefix)) {
    if (message.isMentioned(client.user)) {
      const mention_responses = [
        'My relationship with Arle? Can you handle the knowledge?',
        'I look like Arle? Well of course I do... Haha.',
        'Now...take me to more fun places.',
        'Hahaha... You look surprised. Something wrong?',
        "Ahahaha! I'm having such a great time.",
        "It feels like I've become stronger. I have to thank you.",
        "Defeating me... i'll teach you just what that means!",
        "Hah... what a pointless question... I'm Arle! ...I'm not anything besides that!!",
	      "Today you will definitely acknowledge me... Ahahaha!",
        "No matter how you might want to deny it, the truth remains... that I am what I am...",
        "Is the Arle that you know really Arle, I wonder? Fufufu...",
        "Tell me, are you obligated to prove that you really are yourself? ...Well neither am I.",
        "You get it now, right? There's no need for two Arles...",
      ];
      message.reply(mention_responses[Math.floor(Math.random() * mention_responses.length)]);
    } else return;
  };

  if(message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();
  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

try {
	command.execute(message, args);
} catch (error) {
	console.error(error);
	message.reply('there was an error trying to execute that command!');
}

});

client.login(process.env.bot_token);
