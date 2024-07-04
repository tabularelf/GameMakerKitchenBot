const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resource')
		.setDescription('Links a resource, if it exists.')
		.addStringOption(message => {
			return message
			.setName("resource")
			.setDescription("The resource you'd like to recommend")
			.setRequired(true)
		}),
	async execute(interaction) {
		const http = require('http');
		const fs = require('fs');

		var msg = interaction.options.getString("resource") ?? "";
		msg = msg.toLowerCase();

		const download = function(url, dest, cb) {
		  var file = fs.createWriteStream(dest);
		  var request = http.get(url, function(response) {
		    response.pipe(file);
		    file.on('finish', function() {
		      file.close(cb);  // close() is async, call cb after close completes.
		    });
		  }).on('error', function(err) { // Handle errors
		    fs.unlink(dest); // Delete the file async. (But we don't check the result)
		    if (cb) cb(err.message);
		  });
		};

		const folderName = "./.temp/";
		const searchFile = `${folderName}search.json`;

		try {
			if (!fs.existsSync(folderName)) {
			  fs.mkdirSync(folderName);
			}
		  } catch (err) {
			console.error(err);
		  }

		download("http://www.gamemakerkitchen.com/search.json", searchFile, () => {
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
					
					let url = result.link ?? ("https://gamemakerkitchen.com" + result.value);
					const issuesEmbed = new EmbedBuilder()
						.setColor(0x00CC00)
						.setTitle(result.title + paid)
						.setDescription(`${interaction.member.user} recommends you check out this resource!`)
						.setURL(url)
						.setTimestamp();

						if (result.logo != undefined) {
							let img = result.logo;
							if (img.startsWith("/site-assets/")) {
								img = `https://gamemakerkitche.com/${result.logo}`;
							}
							issuesEmbed.setThumbnail(img);
						}

						return interaction.reply({embeds: [issuesEmbed], fetchReply: true});
				} else {
					return interaction.reply({content: `Content ${msg} not found!`, ephemeral: true});
				}
			});
		});
	},
};