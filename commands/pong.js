const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pong')
		.setDescription('Replies with Ping!'),
	async execute(client, interaction) {
		return interaction.reply('Ping!');
	},
};