const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if (message.mentions.has(message.client.user.id) && (!message.mentions.everyone)) {
            await message.react(`👨‍🍳`);
            await message.react(`🔪`);
        }
    }
}