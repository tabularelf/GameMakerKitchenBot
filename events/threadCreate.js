const { Events } = require('discord.js');

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread) {
        // Ensures that there's a bit of time for Discord to process messages
        setTimeout(async function() { 
        	await thread.messages.fetch(true).then(messages => {
        		let firstMessage = messages.first();
        		if (firstMessage != undefined) {
        			if (firstMessage.pinnable) {
        				firstMessage.pin();
        			} else {
        				console.log(`Message from Guild: ${firstMessage.guildId} Channel: ${firstMessage.channelId} Thread: ${firstMessage.thread} Message: ${firstMessage.id} cannot be pinned!`);
        			}
        		} else {
        			console.log(`The message ${firstMessage} is not the type message!`);
        		}
        	});
        }, 1000);
    }
}
