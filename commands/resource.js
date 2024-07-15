const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const folderName = "./.temp/";
const searchFile = `${folderName}search.json`;
const fs = require('fs');


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
		fs.readFile(searchFile, 'utf8', function (err, data) {
			if (err) throw err;
			obj = JSON.parse(data);
			var result = obj.find((element) => {
				if (element.label.includes("Tag")) return false;
				return element.title.toLowerCase().startsWith(msg);
			});

			// Deeper searching
			if (result == undefined) {
				var result = obj.find((element) => {
					if (element.label.includes("Tag")) return false;
					return element.title.toLowerCase().includes(msg);
				});
			}

			if (result != undefined) {
				let paid = "";
				if (result.paid === true) {
					paid = "💰";
				}

				let defaultURL = "https://gamemakerkitchen.com" + result.value;
				let url = result.link ?? defaultURL;
				const issuesEmbed = new EmbedBuilder()
					.setColor(0x00CC00)
					.setTitle(result.title + paid)
					.setDescription(`Check out this resource ${result.title}!\nFetched from ${defaultURL}.`)
					.setURL(url)
					.setTimestamp();

				if (result.logo != undefined) {
					let img = result.logo;
					if (img.startsWith("/site-assets/")) {
						img = `https://gamemakerkitche.com/${result.logo}`;
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