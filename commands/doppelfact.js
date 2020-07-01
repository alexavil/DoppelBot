const Discord = require('discord.js');
module.exports = {
	name: 'doppelfact',
  description: 'Get a random Doppel fact',
	execute(message) {

    const facts = [
      ":information_source: | Doppelganger Arle in Puyo Puyo~n is primarily fueled by hatred and jealousy of Arle, having an extreme desire to take her place. In Puyo Puyo!! Quest, she is very calm, composed, and secretive to herself and others, though she has fits of laughter. In her Pierrot disguise, she plays up her fool-hardy nature and acts as more of a goofball, though this element is not retained in Quest.",
      ":information_source: | Doppel wears a clown suit, and while wearing that clown suit, she identifies herself as Pierrot. That same clown suit apparently acts as a supressor, supressing alot of Doppel's Magic capabilities. this is mainly seen in Pierrot's lack of a super attack.",
      ":information_source: | It is heavily implied that Doppel's spells are more powerful than Arle's, as Void Hole (Doppel's version of Ruipanko) lasts twice as long. ",
      ":information_source: | It's rather unknown if Doppel died or not after the events of Puyo Puyo 4. As it is implied that she did indeed die after her defeat, but in the credits scene, we see her overlooking the Puyo Puyo circus as herself (and not as Pierrot), implying that she's alright.",
      ":information_source: | According to the Puyo Puyo canon, Doppel spent 500 years on the void, implying that the Madou Monogotari canon is canon here too, as Arle (Pre-Reset) fought the creator and won. However, that victory came at the cost of everything as she knew: it all turned into a void. The Arle that we know today is actually half of this original Arle. The other half would be Doppel, which was stuck in the void untill the events of Puyo Puyo 4.",
      ":information_source: | Rumor has it that Doppel can take people to the Unknown Dimension. It looks like a void similar to the one she spent 500 years in, and there's no way out of it except letting someone drag you out of it, which currently doesn't work 100% of the time. The Unknown Dimension may also appear on well-known locations, which makes it more dangerous.",
    ];
        
message.channel.send(facts[Math.floor(Math.random() * facts.length)]);
	},
};
