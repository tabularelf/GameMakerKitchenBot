module.exports = function(client) {
	const fs = require('node:fs');
	const path = require('node:path');
	const { REST } = require('@discordjs/rest');
	const { Routes } = require('discord.js');
	const { clientID, guildID, token } = require('./config.json');

	const commands = [];
	const commandsPath = path.join(__dirname, 'commands');
	var commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		fs.watchFile(require("path").resolve(filePath), () => { delete require.cache[require.resolve(filePath)] });
		const command = require(filePath);
		commands.push(command.data.toJSON());
	}

	// Setting up docs
	const buildDoc = require('./doc-builder.js');
	const docsPath = path.join(__dirname, 'docs');
	var docsFiles = fs.readdirSync(docsPath);

	for (const file of docsFiles) {
		var filePath = path.join(docsPath, file);
		//const docFolder = require(filePath);
		var files = fs.readdirSync(filePath + '/').filter(file => file.endsWith('.json'));
		var docCommand = buildDoc(file);
		client.commands.set(docCommand.data.name, docCommand);
		for (const mdFile of files) {
			var docPath = path.join(docsPath, mdFile);
			var docName = path.parse(docPath).name;
			// Adds choice to doc
			docCommand.data.addSubcommand(subcommand =>
				subcommand
					.setName(docName)
					.setDescription('Info about ' + docName));
		}
		commands.push(docCommand.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(token);

	/*// for guild-based commands
	rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: [] })
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error);*/

	// for global commands
	/*rest.put(Routes.applicationCommands(clientID), { body: [] })
		.then(() => console.log('Successfully deleted all application commands.'))
		.catch(console.error);*/

	rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}