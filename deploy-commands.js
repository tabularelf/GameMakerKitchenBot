module.exports = function(client, global = false) {
	const fs = require('node:fs');
	const path = require('node:path');
	const { REST } = require('@discordjs/rest');
	const { Routes } = require('discord.js');
	const { clientID, guildID, token } = require('./config.json');
	const Guilds = client.guilds.cache.map(guild => guild.id);

	const commands = [];
	const commandsPrivate = [];
	const commandsPath = path.join(__dirname, 'commands');
	var commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		fs.watchFile(require("path").resolve(filePath), () => { delete require.cache[require.resolve(filePath)] });
		const command = require(filePath);
		if ((command.private ?? false) === false) {
			commands.push(command.data.toJSON());
		}
		commandsPrivate.push(command.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(token);

	if (global) {
		rest.put(Routes.applicationCommands(clientID), { body: commands })
			.then(() => console.log(`Successfully registered application commands for all guilds.`))
			.catch(console.error);

		rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commandsPrivate })
			.then(() => console.log('Successfully registered application commands.'))
			.catch(console.error);
	} else {
		rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commandsPrivate })
			.then(() => console.log('Successfully registered application commands.'))
			.catch(console.error);
	}
}