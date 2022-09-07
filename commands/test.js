const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Replies with Pong!')
		.addSubcommand(subcommand =>
		subcommand
			.setName('user')
			.setDescription('Info about a user')),
	async execute(client, interaction) {
		return interaction.reply('Pongger!');
	},
};