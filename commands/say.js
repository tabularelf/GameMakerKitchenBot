const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('Say')
		.setDescription('Say whatever you want!')
		.addStringOption(message => {
			return message
			.setName("message")
			.setDescription("The contents of the message you'd like to send with")
			.setRequired(true)
		}),
	async execute(interaction) {
		let msg = interaction.options.getString("message") ?? "";
		await interaction.channel.send(`${msg}`);
		interaction.deferReply();
		interaction.deleteReply();
	},
};