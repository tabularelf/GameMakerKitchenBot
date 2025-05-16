const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const PingableRole = require('../mongodb.js'); 

module.exports = {
    private: true,
	data: new SlashCommandBuilder()
		.setName('pingroleregister')
		.setDescription('Registers a role and user to the database')
        .addRoleOption(role => {
            return role
			.setName("role")
			.setDescription("Role you wish to add")
			.setRequired(true)
        })
		.addUserOption(user => {
			return user
			.setName("user")
			.setDescription("The user you wish to add")
            .setRequired(true)
		}),
	async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({content: "Invalid permission", ephemeral: true});
		}

		// Make sure role/user doesn't exists
		let results = await PingableRole.find({ GuildID: interaction.guild.id, RoleID: interaction.options.getRole("role").id });

        let found = false;
        let userID = interaction.options.getUser("user");
        let roleID = interaction.options.getRole("role");
        for(element of results) {
            if (element.UserID == userID) {
                found = true;
                break;
            }
        }

        if (found) {
            return interaction.reply({content: `${userID} and ${roleID} have already been registered!`, ephemeral: true});
        }

        let entry = new PingableRole({
            GuildID: interaction.guild.id,
            RoleID: roleID,
            UserID: userID
        });

        await entry.save();
		
		interaction.reply({content: `${userID} has been successfully authorised to ping ${roleID}!`, ephemeral: true});
	},
};