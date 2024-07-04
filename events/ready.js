const { Events } = require('discord.js');
const reload = require('../deploy-commands.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		reload(client, true);
	},
};