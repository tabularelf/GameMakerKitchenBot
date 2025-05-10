const { Events } = require('discord.js');
const PingableRole = require('../mongodb.js'); 

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		
		await handleCommands(interaction);
		await handleModals(interaction);
	},
};

async function handleModals(interaction) {
	if (!interaction.isModalSubmit()) return;
		
	try {
		switch(interaction.customId) {
			case "pingRole":
				let msg = interaction.fields.getTextInputValue('msgInput');
				let role = interaction.fields.getTextInputValue('roleInput');

				// Make sure role/user exists
				let results = await PingableRole.find({ GuildID: interaction.guild.id, RoleID: role.id });
				if (results.length == 0) {
					return await interaction.reply({content: "Role doesn't exist in database!", ephemeral: true});
				}
		
				let found = false;
				for(element of results) {
					if (element.UserID == interaction.user.id) {
						found = true;
						break;
					}
				}
		
				if (!found) {
					return await interaction.reply({content: "Invalid permission to ping role!", ephemeral: true});
				}
				await interaction.channel.send(`${role} ${msg}`);
				interaction.reply({content: `Successfully pinged!`, ephemeral: true});
			break;
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this submission!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this submission!', ephemeral: true });
		}
	}
}

async function handleCommands(interaction) {
	if (interaction.isChatInputCommand()) {

		const { Collection } = require('discord.js');
		const { cooldowns } = interaction.client;
		const command = interaction.client.commands.get(interaction.commandName);

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;


		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	} else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}
}