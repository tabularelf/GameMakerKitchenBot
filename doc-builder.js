module.exports = function(_name) {
	const { SlashCommandBuilder } = require('discord.js');
	let data = {
		data: new SlashCommandBuilder()
			.setName(_name)
			.setDescription('Returns information of a function from ' + _name),
		async execute(client, interaction, args) {
			const { EmbedBuilder } = require('discord.js');
			const fs = require('node:fs');
			var config = JSON.parse(fs.readFileSync("./docs/" + args.command + "/" + "config", "utf8"));
			var fileData = fs.readFileSync("./docs/" + args.command + "/" + args.subCommand + ".json", "utf8");
			var contents = JSON.parse(fileData);
			const embed = new EmbedBuilder()
				.setColor(parseInt(config.color))
				.setTitle(contents.hasOwnProperty("title") ? contents.title : args.subCommand)
				.setDescription(contents.description);
			if (config.hasOwnProperty("repo")) {
				embed.setAuthor(config.repo);
			}

			if (contents.hasOwnProperty("url")) {
				embed.setURL(contents.url);
			} else if (config.hasOwnProperty("repo")) {
				if (config.repo.hasOwnProperty("url")) {
					embed.setURL(config.repo.url);
				}
			}

			if (contents.hasOwnProperty("args")) {
				for (const entry of contents.args) {
					embed.addFields({ name: "`" + entry.name + "`", value: "`" + entry.type + "`" + ": " + entry.description, inline: true});
				}
            }
			let result = await interaction.reply({ embeds: [embed] });
		}
	}
    return data;
}