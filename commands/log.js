const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('log')
		.setDescription('Prints out a logged image.'),
	async execute(interaction) {
		return interaction.reply({content: `https://raw.githubusercontent.com/tabularelf/GameMakerKitchenBot/main/assets/log.png`, ephemeral: false});
	},
};