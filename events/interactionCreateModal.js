const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		
		try {
			await interaction.reply({ content: interaction.fields.getTextInputValue('hobbiesInput') });
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this submission!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this submission!', ephemeral: true });
			}
		}
	},
};