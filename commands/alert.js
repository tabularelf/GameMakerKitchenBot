const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	private: true,
	cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('alert')
		.setDescription('Alerts deputies of a situation without mentioning them in chat!')
		.addStringOption(message => {
			return message
			.setName("message")
			.setDescription("The contents of the message you'd like to send with")
		}),
	async execute(interaction) {
		let msg = interaction.options.getString("message") ?? "";
		if (msg !== "") {
			msg = "With the message: \"" + msg + "\"";
		}
		const watchTowerChannel = interaction.client.channels.cache.find((channel) => channel.id === '1221790035309760592');

		await watchTowerChannel.send(`@everyone ${interaction.member.user} is pointing out a situation in ${interaction.channel}! ` + msg);
		return interaction.reply({content: "Deputies have been alerted! Thank you!", ephemeral: true});
	},
};