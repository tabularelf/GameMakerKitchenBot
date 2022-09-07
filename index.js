
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');;
const reload = require('./deploy-commands.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	reload(client);
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	var SubCommand = null;
	var args = {};
	try {
		SubCommand = interaction.options.getSubcommand();
    } catch (ex) {
		console.log("Not a Subcommand. Executing: " + interaction.commandName);
	}

	if (SubCommand != null) {
		args = {
			subCommand: SubCommand,
			command: interaction.commandName
		}
	}

	try {
		await command.execute(client, interaction, args);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);