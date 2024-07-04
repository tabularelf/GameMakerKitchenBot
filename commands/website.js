const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('website')
		.setDescription('Print out the server website!'),
	async execute(interaction) {
		return interaction.reply({content: `https://gamemakerkitchen.com/`, ephemeral: false});
	},
};