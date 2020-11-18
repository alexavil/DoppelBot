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
        name: `Doppel Generations (+ Monika DLC)`,
        type: "PLAYING"
    },
});
function DailyDoppel() {
  const doppel_imgs = [
      './images/1f6d3f69f297eb0cbbd4fa55b2eb39acd7ef64fe_full.jpg',
      './images/5f82f4034113f2759e9aed767bf8a20f.jpg',
      './images/13dd2f72488e4b74cbc4736378e7dad9.jpg',
      './images/5e8b7ab2-032f-42cd-a5b5-321813847b0c.png',
      './images/16eee208-27d3-4123-8334-675ab64647f6.png',
      './images/39eb5bdd-4051-49ac-974f-1f353104e758.png',
      './images/754a4977-ebf7-42b5-8784-86167f2d11c8.png',
      './images/59cb0b93-476c-44c3-8d6a-98758895763e.png',
      './images/1252ac67-c134-4b40-9755-55ca56433d87.png',
      './images/02291e16-369c-42fc-a99f-df1df30376c8.png',
      './images/2485cc11-45dc-4133-a5aa-45760be5f7b0.png',
      './images/9372f7b7-cd18-4fed-8333-2a67712c742e.png',
      './images/1086212i.jpeg',
      './images/24862a61-a92b-4e7b-a10f-6c0d9e2bd813.png',
      './images/1143719i.jpeg',
      './images/1626232i.jpeg',
      './images/2248953i.jpeg',
      './images/6424877i.jpeg',
      './images/6440424i.jpeg',
      './images/8071897i.jpeg',
      './images/16121356_p0_square1200.jpg',
      './images/45093982_p0_square1200.jpg',
      './images/471705293.2.jpg',
      './images/ab7a13b9-009b-40cc-b604-dc6068b24c1b.png',
      './images/bf5e2a75-784a-484e-bad7-678090a39aa9.png',
      './images/ce7ed27b-63d7-4de9-8f5c-6c1ed6b6698e.png',
      './images/db52ba7d-0d9b-4811-a89d-758be8ca0c16.png',
      './images/doppel13.png',
      './images/doppel11.jpg',
      './images/doppel13.jpg',
      './images/doppel14.png',
      './images/Doppel4.jpeg',
      './images/Doppel6.jpg',
      './images/Doppel7.png',
      './images/doppelganger_arle_puyopuyo_and_1_more_drawn_by_kawamochi_mocchii__28ae11906bc6d9105748216fb874f3f3.png',
      './images/doppelganger_arle_puyopuyo_and_1_more_drawn_by_tsukino_neru__2ba4718440e21be03fd26ba7bfec3e95.jpg',
      './images/doppelganger_arle_puyopuyo_and_1_more_drawn_by_zubon_no_onara__sample-18828f09a416042571183f81e46319.jpg',
      './images/doppellaying.jpg',
      './images/doppelonbreak.png',
      './images/EN9wLmeWsAIGQ82.jpeg',
      './images/fdc88299-f8d9-478b-983f-0f34a07ff2ef.png',
      './images/flat1000x1000075f.u2.jpg',
      './images/gigavoidhole.jpeg',
      './images/image164560795l.png',
      './images/megavoidhole.png',
      './images/merryfuckingxmas.jpeg',
      './images/picture_pc_79cfb9c4e9e99700dce5b6cabe560d94.jpg.png',
      './images/tumblr_d59c68b25c5698ed9d913ba51c5bf0d9_1c3d21bf_640.png',
      './images/twoarlestwice2.jpeg',
      './images/woarlestwice3.jpeg',
      './images/twoarlestwice4.jpeg',
      './images/Voidhole.jpg',
      './images/DoL8sKPUcAAb81x.jpeg',
      './images/doppelpfp.png',
      './images/EQPqXovU8AA7XwY.jpeg',
      './images/EUD9zxiUEAAgcaR.jpeg',
      './images/ER7y9z4U0AAEC72.jpeg',
      './images/re.jpeg',
      './images/unnamed.jpg',
      './images/doppelganger_arle_puyopuyo_and_1_more_drawn_by_tsukino_neru__2ba4718440e21be03fd26ba7bfec3e95.jpg',
      './images/ESRFvYOU0AEjOJt.jpgsmall.jpeg',
      './images/4838999i.jpeg',
      './images/2987601-tenLxHNjMEtMuAQN.png',
      './images/566.jpeg',
      './images/c469.jpg',
      './images/image158144862l.png',
      './images/DoCuhm5XoAAikZs.jpeg',
      './images/C1f_IF_UQAADKX_.jpeg',
      './images/C0bxbA5UQAQ0dle.jpeg',
      './images/8625520i.jpeg',
      './images/1184609i.jpeg',
      './images/45.png',
      './images/doppel.jpeg',
      './images/doppel16.jpg',
      './images/doppelsmirk.png',
      './images/ETtO5c8UMAAoemv.jpeg',
      './images/EV_OBXbXkAcx-_G.jpeg',
      './images/EWVP_PCUwAAixDP.jpeg',
      './images/EVPQnKJUcAIcYCA.jpeg',
      './images/doppel_puyo4.jpeg',
      './images/external-content.duckduckgo.com.jpeg',
      './images/image0.png.jpeg',
      './images/B7Ewh3HCAAELl9A.jpeg',
      './images/B95B4WKCQAETvW6.jpeg',
      './images/B_dSAaRUwAAYqYU.jpeg',
      './images/Bln_huDCcAAt4J2.jpeg',
      './images/C7sJh8jUwAApay7.jpeg',
      './images/C9Dxlt_UQAEph1J.jpeg',
      './images/C9DxluHVoAA98pW.jpeg',
      './images/C9DxlvjUAAA4KOw.jpeg',
      './images/C9DxlwJU0AAfY-Z.jpeg',
      './images/C68JBX5WwAA_A-0.jpeg',
      './images/CK5hJJ3UsAAOxRR.jpeg',
      './images/CvSzI7DVIAAEIyX.jpeg',
      './images/CwwA9wyUcAY8DWA.jpeg',
      './images/CZkczBJUMAApWhs.jpeg',
      './images/DFGbkFhUMAYAnX7.jpeg',
      './images/DLmp1mQV4AAGysp.jpeg',
      './images/DNT-PA8VQAAz46P.jpeg',
      './images/DP4JW6oUQAAkjHN.jpeg',
      './images/DQr3y8TVoAY2AIG.jpeg',
      './images/DU3cVYLUQAASw36.jpeg', 
      './images/DXRDBvNV4AAs_eh.jpeg',
      './images/DyowTwvUcAA5lCW.jpeg',
      './images/EI1wce2UwAA5mdF.jpeg',
      './images/EKXGsLxUYAIHH47.jpeg',
      './images/ERdx_4VU8AArDcD.jpeg',
      './images/ERh-tJEU0AE7HQC.jpeg',
      './images/ES_MBwXUMAEWJf-.jpeg',
      './images/EUL62tyUcAEiv_R.jpeg',
      './images/EV_OBXbXkAcx-_G.jpeg',
      './images/EWcvr8EUMAAo2gp.png', 
      './images/EXB0A15UwAE_VCe.jpeg',
      './images/EXbNA42UMAEu-8U.jpeg',
      './images/EXIs6kCWsAMEosg.png',
      './images/EXp8yJkUEAcWg1E.jpeg',
      './images/EXQehW2UEAAZwpA.jpeg',
      './images/EY9wamfXYAEeo9H.png',
      './images/EY9wbg4WAAAJwj_.jpeg',
      './images/EY9xItPX0AAX5xl.jpeg',
      './images/EYBKzKnXYAMQMyx.jpeg',
      './images/EYOkvpiU4AAJPVC.jpeg',
      './images/your-way-cinnabar-wide-large-doppel-edition.png',
      './images/Ea81gY4UwAUEclH.jpeg',
      './images/EaARFfXU0AEABuW.jpeg',
      './images/EbDTiblU0AAhuu9.jpeg',
      './images/EbkZeTSU8AIVrAm.jpeg',
      './images/EbSfb-hVcAAHftX.jpeg',
      './images/EbxZQz7UYAAycZ3.jpeg',
      './images/EITkG-eXkAAuH63.jpeg',
      './images/ETMUfBzUEAA86J8.jpeg',
      './images/EWIpO-XUYAAd0z9.jpeg',
      './images/EWnN0iKUwAEyWVw.jpeg',
      './images/EYXjHIiUYAEbJT6.jpeg',
      './images/EZlIp5bVcAEAclO.jpeg',
      './images/EZRaRHQUwAAq60X.jpeg',
      './images/EcZlA4RU4AAU_J_.jpeg',
      './images/EeG98MNVAAA9RCy.jpeg',
      './images/EfIy1ndUcAEQ_5S.jpeg',      
];
  const channel = client.channels.get('694943149142966396');
  channel.send("You know what they say? A Doppel a day keeps your sadness away! Here's your Daily Doppel! :heart:", {
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
