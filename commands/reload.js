const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads the bot'),
	async execute(client, interaction) {
		client.commands.clear();
		const reload = require('../deploy-commands.js');
		const fs = require('node:fs');
		const path = require('node:path');
		const commandsPath = path.join(__dirname, './');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			client.commands.set(command.data.name, command);
		}

		reload(client);
		interaction.reply('Bot reloaded!');
	},
};