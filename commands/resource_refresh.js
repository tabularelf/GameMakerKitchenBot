const { SlashCommandBuilder } = require('discord.js');
const { AutoDownloadSearchJSON } = require('../src/utilities.js');

module.exports = {
	private: true,
	data: new SlashCommandBuilder()
		.setName('resource_refresh')
		.setDescription('Refreshes the resource.json file.'),
	async execute(interaction) {
		await AutoDownloadSearchJSON();
		return await interaction.reply({content: `Refreshed resource.json!`, ephemeral: true});
	},
};