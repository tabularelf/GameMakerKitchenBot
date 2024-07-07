const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DESTINATED_CHANNEL = '1179825156680601630';
const { GeneratePageFromCommand } = require('../generatepage.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate-resource-page')
		.setDescription('Generate a page resource')
		.addChannelOption(option => {
			return option
			.setName("thread")
			.setDescription("The thread to refer to for the contents of the resource post")
			.setRequired(true)
		})
		.addStringOption(option => {
			return option
			.setName("link")
			.setDescription("The link to the associated resource")
			.setRequired(true)
		})
		.addStringOption(option => {
			return option
			.setName("description")
			.setDescription("The description the assoicated resource has")
			.setRequired(true)
		})
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of resource this is')
				.setRequired(true)
				.addChoices(
				{ name: 'Library', value: 'lib' },
				{ name: 'Tool', value: 'tool' },
				{ name: 'Asset', value: 'asset' },
				{ name: 'Tutorial', value: 'tutorial' },
				{ name: 'Snippet', value: 'snippet' },
		))
		.addStringOption(option => {
			return option
			.setName("tags")
			.setDescription("The tags the assoicated resource has")
			.setRequired(true)
		})
		.addStringOption(option => {
			return option
			.setName("authors")
			.setDescription("The authors assoicated resource has")
			.setRequired(true)
		})
		.addBooleanOption(option => 
			option.setName('paid')
			.setDescription('Whether this resource is paid or not')
			.setRequired(true)
		)
		.addStringOption(option => {
			return option
			.setName("docs")
			.setDescription("The docs link to the associated resource")
		}),
	async execute(interaction) {
		const thread = interaction.options.getChannel("thread");
		const link = interaction.options.getString("link");
		const description = interaction.options.getString("description");
		const tags = interaction.options.getString("tags");
		const authors = interaction.options.getString("authors");
		const type = interaction.options.getString("type");
		const docs = interaction.options.getString("docs") ?? undefined;
		const paid = interaction.options.getBoolean("paid");

		interaction.deferReply();

		await thread.messages.fetch(true).then(messages => {
			let result = GeneratePageFromCommand({
				thread: thread,
				link: link,
				docs: docs,
				firstMessage: messages.last(),
				tags: tags,
				description: description,
				authors: authors,
				type: type,
				paid: paid
			});
		});

		if (result.url != undefined) {
			const resultEmbed = new EmbedBuilder()
				.setColor(0x00CC00)
				.setTitle(`Submission: ${thread.name}`)
				.setDescription(`Submission made!`)
				.setURL(result.url)
				.setTimestamp();
			
			return interaction.reply({ embeds: [issuesEmbed], fetchReply: true });
		}
	},
};