
// General Setup
const { token, mongoDBAddress } = require('./config.json');
const schedule = require('node-schedule');
const { AutoDownloadSearchJSON } = require('./src/utilities.js');

// MongoDB setup
const mongoose = require('mongoose');

mongoose.connect(mongoDBAddress).then(console.log('Connected to Mongodb.'));

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.DirectMessageReactions,
	],
	partials: [Partials.Message, Partials.User, Partials.Reaction]
});

module.exports.client = client;

// Commmands
client.commands = new Collection();
client.cooldowns = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

var j = schedule.scheduleJob('0 0 */1 * * *', async function(){
	await AutoDownloadSearchJSON();
});
AutoDownloadSearchJSON();