const { Events } = require('discord.js');
const { GeneratePageFromText } = require("../generatepage.js");
const DESTINATED_CHANNEL = '1047095400278020136';

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread) {
		var firstMessage;
		// Ensures that there's a bit of time for Discord to process messages
		setTimeout(async function () {
			await thread.messages.fetch(true).then(messages => {
				firstMessage = messages.last();
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

			if (thread.parentId == DESTINATED_CHANNEL) {
				//await thread.send('Use `/generate-resource-page` to generate a PR for GameMaker Kitchen\'s website! ฅ^•ﻌ•^ฅ');
			}
			//GeneratePageFromText(thread, firstMessage);
		}, 1000);
	}
}
