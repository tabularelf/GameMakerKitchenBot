const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backticks')
		.setDescription('Demonstrate how to format code with backticks!'),
	async execute(interaction) {
		const colors = [0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x4b0082, 0xee82ee];
		const exampleCode = "show_debug_message(\"Hello World!\");";
		const escapedCode = "\\`\\`\\`gml\n" + exampleCode + "\n\\`\\`\\`";
		let pos = Math.floor(Math.random()*colors.length);
		let col = colors[pos];
		const exampleEmbed = new EmbedBuilder()
			.setColor(col)
			.setTitle('Using backticks')
			.setDescription(`You can use backticks to format code. i.e. \n${escapedCode}\n\`\`\`gml\n${exampleCode}\n\`\`\``)
			.setTimestamp();


		return interaction.reply({embeds: [exampleEmbed], fetchReply: true});
	},
};