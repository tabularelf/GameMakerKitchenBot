const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const PingableRole = require('../mongodb.js'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingrolenew')
		.setDescription('Pings the specified role, with an optional message')
        .addRoleOption(role => {
            return role
			.setName("role")
			.setDescription("Role you wish to ping")
			.setRequired(true)
        })
		.addBooleanOption(performTestsOption => {
			return performTestsOption
			.setName("perform_tests")
			.setDescription("Whether to perform a secret test. Default is false.")
		}),
	async execute(interaction) {
		let performTest = interaction.options.getBoolean("perform_tests")  ?? false;
		// Make sure role/user exists
		let results = await PingableRole.find({ GuildID: interaction.guild.id, RoleID: interaction.options.getRole("role").id });
		if (results.length == 0) {
			return interaction.reply({content: "Role doesn't exist in database!", ephemeral: true});
		}

        let found = false;
        for(element of results) {
            if (element.UserID == interaction.user.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            return interaction.reply({content: "Invalid permission to ping role!", ephemeral: true});
        }

		const modal = new ModalBuilder()
			.setCustomId(performTest ? 'pingRoleTest' : 'pingRole')
			.setTitle('Ping role' + performTest ? ' (Test mode)' : '');

		const roleInput = new TextInputBuilder()
			.setCustomId('roleInput')
			.setLabel("Role to ping (DO NOT MODIFY THIS PLEASE)")
			.setValue(`${interaction.options.getRole("role").id}`)
			.setMaxLength(50)
			.setStyle(TextInputStyle.Short);	

		const msgInput = new TextInputBuilder()
			.setCustomId('msgInput')
			.setLabel("Message to send")
			.setValue("New update!")
			.setMaxLength(1_950)
			.setMinLength(5)
			.setStyle(TextInputStyle.Paragraph);	
		
		const roleRow = new ActionRowBuilder().addComponents(roleInput);
		const msgRow = new ActionRowBuilder().addComponents(msgInput);
		modal.addComponents(msgRow, roleRow);

		await interaction.showModal(modal);
		//interaction.deferReply();
		//interaction.deleteReply();
	},
};