const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resource')
		.setDescription('Links a resource, if it exists.')
		.addStringOption(message => {
			return message
			.setName("message")
			.setDescription("The contents of the message you'd like to send with")
			.setRequired(true)
		}),
	async execute(interaction) {
		const http = require('http');
		const fs = require('fs');

		var msg = interaction.options.getString("message") ?? "";
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
					return element.title.toLowerCase().includes(msg);
				});

				if (result != undefined) {
					let paid = "";
					if (result.paid === true) {
						paid = "💰";
					}
					return interaction.reply({content: `${interaction.member.user} recommends [${result.title}${paid}](${result.link ?? ("https://gamemakerkitchen.com" + result.value)})! Check it out!`, ephemeral: false});
				} else {
					return interaction.reply({content: `Content ${msg} not found!`, ephemeral: true});
				}
			});
		});
	},
};