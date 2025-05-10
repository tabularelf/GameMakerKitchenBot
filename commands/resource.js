const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
		}),
	async autocomplete(interaction) {
		const focusedValue  = interaction.options.getFocused().toLowerCase();
		console.log(focusedValue);


		const output = [];
		let data = fs.readFileSync(searchFile, 'utf8');
		let obj = JSON.parse(data);
		let count = 0;
		for(key in obj) {
			var element = obj[key];
			if (element.label.includes('Tag') === false) {
				if (element.title.toLowerCase().startsWith(focusedValue) || element.title.toLowerCase().includes(focusedValue)) {
					output.push({name: element.label, value: element.title});
					if (++count > 5) break;
				} 
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
				if ('threadLink' in result) {
					desc = `${desc}\n\nThread Link: ${result.threadLink}`
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
					.setDescription(desc)
					.setURL(defaultURL)
					.setTimestamp();

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