const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	private: true,
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads the bot')
		.addBooleanOption(bool => {
            return bool
			.setName("global")
			.setDescription("Registers the commands globally")
        }),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({content: "Invalid permission", ephemeral: true});
		}

		interaction.client.commands.clear();
		const reload = require('../deploy-commands.js');
		const fs = require('node:fs');
		const path = require('node:path');
		const commandsPath = path.join(__dirname, './');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			interaction.client.commands.set(command.data.name, command);
		}
		
		reload(interaction.client, interaction.options.getBoolean("global") ?? false);
		interaction.reply('Bot reloaded!');
	},
};