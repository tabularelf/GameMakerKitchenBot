const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
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
		var msg = "";
		var role = undefined;
		switch(interaction.customId) {
			case "pingRole":
				msg = interaction.fields.getTextInputValue('msgInput');
				role = interaction.fields.getTextInputValue('roleInput');

				// Make sure role/user exists
				let results = await PingableRole.find({ GuildID: interaction.guild.id, RoleID: role });
				if (results.length == 0) {
					return await interaction.reply({content: "Role doesn't exist in database!", ephemeral: true});
				}

				const confirm = new ButtonBuilder()
					.setCustomId('confirm')
					.setLabel('Publish')
					.setStyle(ButtonStyle.Success);

				const edit = new ButtonBuilder()
					.setCustomId('edit')
					.setLabel('Edit')
					.setStyle(ButtonStyle.Primary);

				const cancel = new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Secondary);

				const row = new ActionRowBuilder()
					.addComponents(confirm, edit, cancel);
		
				const response = await interaction.reply({content: `<@&${role}> ${msg.replaceAll('@everyone', '').replaceAll('@here', '')}`, ephemeral: true, components: [row], withResponse: true});
				
				const collectorFilter = i => i.user.id === interaction.user.id;
				const confirmation =  response.resource.message.createMessageComponentCollector({ filter: collectorFilter, time: 900_000 });
				confirmation.on('collect', async confirmation => {
					try {
						if (confirmation.customId === 'confirm') {
							await interaction.channel.send(`<@&${role}> ${msg.replaceAll('@everyone', '').replaceAll('@here', '')}`);
							await confirmation.update({ content: `<@&${role}> has been successfully submitted!`, components: [] });
						} else if (confirmation.customId === 'cancel') {
							await confirmation.update({ content: 'Ping role cancelled.', components: [] });
						} else if (confirmation.customId === 'edit') {
							const modal = new ModalBuilder()
								.setCustomId('pingRole')
								.setTitle(`Ping role`);
							const roleInput = new TextInputBuilder()
								.setCustomId('roleInput')
								.setLabel("Role to ping (DO NOT MODIFY THIS PLEASE)")
								.setValue(role)
								.setMaxLength(50)
								.setStyle(TextInputStyle.Short);	
							const msgInput = new TextInputBuilder()
								.setCustomId('msgInput')
								.setLabel("Message to send")
								.setValue(msg)
								.setMaxLength(1_950)
								.setMinLength(5)
								.setStyle(TextInputStyle.Paragraph);	
							const roleRow = new ActionRowBuilder().addComponents(roleInput);
							const msgRow = new ActionRowBuilder().addComponents(msgInput);
							modal.addComponents(msgRow, roleRow);
							confirm.setDisabled(true);
							edit.setDisabled(true);
							cancel.setDisabled(true);
							await confirmation.showModal(modal);
						}
					} catch(error) {
						if (interaction.replied || interaction.deferred) {
							await interaction.followUp({ content: 'The interaction was cancelled or an error occurred!', ephemeral: true });
						} else {
							await interaction.reply({ content: 'The interaction was cancelled or an error occurred', ephemeral: true });
						}
						console.log(error);
					}
				})
			break;
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this modal!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this modal!', ephemeral: true });
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