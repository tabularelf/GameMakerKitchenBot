const { SlashCommandBuilder } = require('discord.js');
const { AutoDownloadSearchJSON } = require('../src/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resource_resfresh')
		.setDescription('Refreshes the resource.json file.'),
	async execute(interaction) {
		await AutoDownloadSearchJSON();
		return await interaction.reply({content: `Refreshed resource.json!`, ephemeral: true});
	},
};