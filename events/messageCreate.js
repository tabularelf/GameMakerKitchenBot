const { Events } = require('discord.js');
const Emotes = [
    `🍳`,
    `🔪`,
    `🍴`,
    `🍪`,
    '👍',
    '👌',
    '☕'
]
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if (message.mentions.has(message.client.user.id) && (!message.mentions.everyone)) {
            let emotePos = Math.floor(Math.random() * Emotes.length)
            await message.react(`👨‍🍳`);
            await message.react(Emotes[emotePos]);
        }
    }
}