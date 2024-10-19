const { SlashCommandBuilder } = require('discord.js');
const PingableRole = require('../mongodb.js'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingrole')
		.setDescription('Pings the specified role, with an optional message')
        .addRoleOption(role => {
            return role
			.setName("role")
			.setDescription("Role you wish to ping")
			.setRequired(true)
        })
		.addStringOption(message => {
			return message
			.setName("message")
			.setDescription("The contents of the message you'd like to send with")
		})
		.addBooleanOption(message => {
			return message
			.setName("newlines")
			.setDescription("Whether to escape all newlines or not. Default is false.")
		}),
	async execute(interaction) {

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


		let msg = interaction.options.getString("message") ?? "";
		if(interaction.options.getBoolean("newlines") ?? false) {
			msg = msg.replaceAll("\\n", "\n"); 
		}			
		//interaction.deferReply();
		//interaction.deleteReply();
		await interaction.channel.send(`${interaction.options.getRole("role")} ${msg}`);
		interaction.reply({content: `${interaction.options.getRole("role")} has been successfully pinged!`, ephemeral: true});
	},
};