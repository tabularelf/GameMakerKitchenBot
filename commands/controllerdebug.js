const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	private: true,
	data: new SlashCommandBuilder()
		.setName('controllerdebug')
		.setDescription('Print out troubleshooting steps')
		.addUserOption(message => {
			return message
			.setName("user")
			.setDescription("The user to mention")
			.setRequired(false)
		}),
	async execute(interaction) {
		const msg = '### "Connected my gamepad and I\'m pressing buttons but verbs aren\'t activating, or are behaving strangely"'
		+ '\n1. Check if your gamepad is working OK on an OS level. On Windows, use the "Game Controllers" dialogue (Start > Run > joy.cpl). Common issues to consider: remappers like Steam Input, DS4Windows, etc. may cause trouble: try quitting these. Nintendo Switch controllers don\'t work on many platforms over USB: try Bluetooth. Some devices require additional setup: see [Gamepad Troubleshooting](<https://offalynne.github.io/Input/#/6.1/Gamepad-Troubleshooting>)'
		+ '\n\n2. [Download the example project](<https://github.com/JujuAdams/Input/archive/refs/heads/master.zip>), and try out the `obj_gamepad_tester` Object. This helps visualize what\'s going on with your gamepad. On the right, you can see what\'s going on with player and verbs. On the left, you can see what\'s going on with the gamepad. You may need to cycle through gamepad indexes (use arrow keys) in some cases'
		+ '\n\n3. Have a look at the log for more information on gamepad connection. If you need more help, we\'ll need you to share the information you see here: : https://discord.com/channels/724320164371497020/725060331759730738/1016327629718175747'
		let user = interaction.options.getUser("user") ?? "";
		return interaction.reply({content: `${msg} ${user}`, ephemeral: false});
	},
};