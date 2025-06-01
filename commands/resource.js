const { SlashCommandBuilder, EmbedBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const folderName = "./.temp/";
const searchFile = `${folderName}resource.json`;
const fs = require('fs');
const { extractOwnerRepo, getLatestGithubRelease } = require('../src/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resource')
		.setDescription('Links a resource, if it exists.')
		.addStringOption(message => {
			return message
				.setName("resource")
				.setDescription("The resource you'd like to recommend")
				.setRequired(false)
				.setAutocomplete(true)
		})
		.addStringOption(author => {
			return author.setName("author")
				.setDescription("The author/s you wish to look up")
				.setRequired(false)
				.setAutocomplete(true)
		})
		.addStringOption(type => {
			return type.setName("type")
			.setDescription("The type of resource you wish to look up")
			.setRequired(false)
			.setChoices([
				{name: 'plugin', value: 'plugin'},
				{name: 'tutorial', value: 'tutorial'},
				{name: 'library', value: 'library'},
				{name: 'snippet', value: 'snippet'},
				{name: 'tool', value: 'tool'},
			])
		})
		.addBooleanOption(paid => {
			return paid.setName("paid")
			.setDescription("Whether this resource is paid or not")
			.setRequired(false)
		})
		.addStringOption(tag => {
			return tag.setName("tag")
			.setDescription("The tag/s of a particular resource")
			.setRequired(false)
			.setAutocomplete(true)
		})
		.setIntegrationTypes([
        	ApplicationIntegrationType.GuildInstall, // Allows installation to servers (value: 0)
        	ApplicationIntegrationType.UserInstall   // Allows installation by users to their account (value: 1)
    	])
    	.setContexts([
    	    InteractionContextType.Guild,           // Usable in servers (value: 0)
    	    InteractionContextType.BotDM,           // Usable in DMs with the bot (value: 1)
    	    InteractionContextType.PrivateChannel   // Usable in Group DMs & other DMs if user-installed (value: 2)
    	]),
	async autocomplete(interaction) {	
		const focusedValue  = interaction.options.getFocused(true);
		const inputValue = focusedValue.value.toLowerCase();
		
		//if (focusedValue.name == 'type') {
		//	const output = [
		//		
		//	].sort((a, b) => a.name - b.name);
		//	return await interaction.respond(output);
		//}
		
		const output = [];
		let data = fs.readFileSync(searchFile, 'utf8');
		let obj = JSON.parse(data);
		let count = 0;

		if (focusedValue.name == 'author') {
			obj = obj.filter((value, index, array) => array.indexOf(value) === index);
			let authors = [];
			for(let elm of obj) {
				for (let author of elm.author) {
					authors.push(author.toLowerCase());
				}
			}
			authors = authors.filter((value, index, array) => array.indexOf(value) === index);
			for (let author of authors) {
				if (author.startsWith(inputValue) && !output.includes(author)) {
					output.push({name: author, value: author});
					++count;
				} else if ((inputValue == '') && !output.includes(author)) {
					output.push({name: author, value: author});
					++count;
				} 
				if (count > 24) break;
			}
			return await interaction.respond(output);
		}

		if (focusedValue.name == 'tag') {
			obj = obj.filter((value, index, array) => array.indexOf(value) === index);
			let tags = [];
			for(let elm of obj) {
				for (let tag of elm.tags) {
					tags.push(tag.toLowerCase());
				}
			}

			tags = tags.filter((value, index, array) => array.indexOf(value) === index);
			for (let tag of tags) {
				if (tag.includes(inputValue) && !output.includes(tag)) {
					output.push({name: tag, value: tag});
					++count;
				} else if ((inputValue == '') && !output.includes(tag)) {
					output.push({name: tag, value: tag});
					++count;
				} 
				if (count > 24) break;
			}
			return await interaction.respond(output);
		}

		var author = interaction.options.getString('author');
		var tag = interaction.options.getString('tag');
		var type = interaction.options.getString('type');
		var paid = interaction.options.getBoolean('paid');
		if (author !== null || tag !== null || type !== null || paid !== null) {
			if (author !== null) {
				let distinct = [];
				for(let elm of obj) {
					if ((author ?? undefined) != undefined) {
						if (elm.author.join(',').toLowerCase().split(',').includes(author)) {
							distinct.push(elm);
						}
					}
				}
				obj = distinct;
			}
			
			if (tag !== null) {
				let distinct = [];
				for(let elm of obj) {
					if (elm.tags.includes(tag)) {
						distinct.push(elm);
					}
				}
				obj = distinct;
			}

			if (type !== null) {
				let distinct = [];
				for(let elm of obj) {
					if (elm.type == type) {
						distinct.push(elm);
					}
				}
				obj = distinct;
			}

			if (paid !== null) {
				let distinct = [];
				for(let elm of obj) {
					if (elm.paid == paid) {
						distinct.push(elm);
					}
				}
				obj = distinct;
			}
		}
		
		for(let key in obj) {
			var element = obj[key];

			if (`${element.label} - ${element.author.join(' ')}`.toLowerCase().startsWith(inputValue) || 
				`${element.title} - ${element.author.join(' ')}`.toLowerCase().startsWith(inputValue) ||
				element.author.join(' ').toLowerCase().includes(inputValue) ||
				element.tags.includes(inputValue) ||
				`${element.title}`.toLowerCase().startsWith(inputValue)) {
				output.push({name: `${element.label} - ${element.author.join(', ')}`, value: element.title});
				if (++count > 24) break;
			} 
		}
		return await interaction.respond(output);
	},
	async execute(interaction) {

		var msg = interaction.options.getString("resource") ?? "";
		msg = msg.toLowerCase();

		if (msg == "") {
			return await interaction.reply({ content: `Resource argument was not fulfilled. Please fill in a valid argument!`, ephemeral: true })
		}

		try {
			if (!fs.existsSync(folderName)) {
				fs.mkdirSync(folderName);
			}
		} catch (err) {
			console.error(err);
		}

		var obj;
		fs.readFile(searchFile, 'utf8', async function (err, data) {
			if (err) throw err;
			obj = JSON.parse(data);
			var result = obj.find((element) => {
				return element.title.toLowerCase().startsWith(msg);
			});

			// Deeper searching
			if (result == undefined) {
				var result = obj.find((element) => {
					return element.title.toLowerCase().includes(msg);
				});
			}

			if (result != undefined) {
				let paid = "";
				if (result.paid === true) {
					paid = "💰";
				}

				let defaultURL = "https://gamemakerkitchen.com" + result.path;
				let url = result.link ?? defaultURL;
				let repoInfo = extractOwnerRepo(url);
				let desc = result.description
				let release = null;
				let title = result.title;
				let date = result.date;
				if ('threadLink' in result) {
					desc = `${desc}\n\nThread Link: ${result.threadLink}`
				} else if ('supportLink' in result) {
					desc = `${desc}\nSupport Link: ${result.supportLink}`
				}
				if ('docs' in result) {
					if (result.docs.length > 0) {
						desc = `${desc}\nDocs: ${result.docs}`;
					}
				}

				if (repoInfo !== null) {
					release = await getLatestGithubRelease(repoInfo.owner, repoInfo.repo);
				}
				
				if (release !== null) {
					desc += `\n### Download the latest release [here](${release.html_url})!`;
				}

				desc += `\n-# Available from ${url}.`;
				
				const issuesEmbed = new EmbedBuilder()
					.setColor(0x00CC00)
					.setTitle(title + paid)
					.setAuthor({ name: `${result.author[0]}`, url: `https://gamemakerkitchen.com/authors/${result.authorsSafe[0].replaceAll(' ', '-').replaceAll('_', '-')}` })
					.setDescription(desc)
					.setURL(defaultURL);

				if (result.logo != undefined) {
					let img = result.logo;
					if (img.startsWith("/site-assets/")) {
						img = `https://gamemakerkitchen.com${result.logo}`;
					}
					issuesEmbed.setThumbnail(img);
				}

				return interaction.reply({ embeds: [issuesEmbed], fetchReply: true });
			} else {
				return interaction.reply({ content: `Content ${msg} not found!`, ephemeral: true });
			}
		});
	},
};