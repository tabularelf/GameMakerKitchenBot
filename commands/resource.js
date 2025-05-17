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
				.setRequired(true)
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
		const focusedValue  = interaction.options.getFocused().toLowerCase();


		const output = [];
		let data = fs.readFileSync(searchFile, 'utf8');
		let obj = JSON.parse(data);
		let count = 0;
		for(key in obj) {
			var element = obj[key];
			if (`${element.label} - ${element.author.join(' ')}`.toLowerCase().startsWith(focusedValue) || 
				`${element.title} - ${element.author.join(' ')}`.toLowerCase().startsWith(focusedValue) ||
				element.authorSafe.some(entry => focusedValue.split(" ").some(entry)) ||
				element.tags.some(entry => focusedValue.split(' ').some(entry))) {
				output.push({name: `${element.label} - ${element.author.join(', ')}`, value: element.title});
				if (++count > 24) break;
			} 
		}
		await interaction.respond(output);
	},
	async execute(interaction) {

		var msg = interaction.options.getString("resource") ?? "";
		msg = msg.toLowerCase();

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