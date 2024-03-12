const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('log')
		.setDescription('Prints out a logged image.'),
	async execute(interaction) {
		await interaction.channel.send(`https://raw.githubusercontent.com/tabularelf/GameMakerKitchenBot/main/assets/log.png`);
		interaction.deferReply();
		interaction.deleteReply();
	},
};