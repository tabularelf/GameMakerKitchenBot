const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GeneratePageFromCommand } = require('../generatepage.js');
const DESTINATED_CHANNEL = '1047095400278020136';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate-resource-page')
		.setDescription('Generate a page resource')
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
		.addChannelOption(option => {
			return option
			.setName("thread")
			.setDescription("The thread to refer to for the contents of the resource post")
		})
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of resource this is')
				.addChoices(
				{ name: 'Library', value: 'librarie' },
				{ name: 'Tool', value: 'tool' },
				{ name: 'Asset', value: 'asset' },
				{ name: 'Tutorial', value: 'tutorial' },
				{ name: 'Snippet', value: 'snippet' },
		))
		.addBooleanOption(option => 
			option.setName('paid')
			.setDescription('Whether this resource is paid or not')
		)
		.addStringOption(option => {
			return option
			.setName("docs")
			.setDescription("The docs link to the associated resource")
		})
		.addStringOption(option => {
			return option
			.setName("title")
			.setDescription("The name of the associated resource")
		}),
	async execute(interaction) {
		const thread = interaction.options.getChannel("thread") ?? interaction.channel;
		const link = interaction.options.getString("link");
		const description = interaction.options.getString("description");
		const tags = interaction.options.getString("tags");
		const authors = interaction.options.getString("authors");
		const type = interaction.options.getString("type");
		const docs = interaction.options.getString("docs") ?? "";
		const paid = interaction.options.getBoolean("paid");
		const title = interaction.options.getString("title") ?? thread.name;
		if (thread.parentId !== DESTINATED_CHANNEL) {
			return interaction.reply({content: `\`${thread.name}\` is not a valid resource!`, ephemeral: true});
		}

		await interaction.deferReply();
		var result;
		var threadTags = thread.parent.availableTags.filter(tag => thread.appliedTags.includes(tag.id)).map(tag => tag.name.toLowerCase());
		var paidTag = threadTags.includes('paid');
		let index = threadTags.indexOf('paid');
		if (index !== 1) {
			threadTags.splice(index, 1);
		}
		await thread.messages.fetch(true).then(messages => {
			result = GeneratePageFromCommand({
				thread: thread,
				title: title,
				link: link,
				docs: docs,
				firstMessage: messages.last(),
				tags: tags,
				description: description,
				authors: authors,
				type: type ?? threadTags[0],
				paid: paid ?? paidTag
			});
		});

		console.log("I have the PR!");
		const resultEmbed = new EmbedBuilder()
			.setColor(0x00CC00)
			.setTitle(`Submission: ${title}`)
			.setDescription(`Submission made to GameMaker Kitchen Website repo!\nPlease check the PR section!`)
			.setURL('https://github.com/tabularelf/gamemaker-kitchen/pulls')
			.setTimestamp();
		
		await interaction.followUp({ embeds: [resultEmbed], fetchReply: true});
	},
};