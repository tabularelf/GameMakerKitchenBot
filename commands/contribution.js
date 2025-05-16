const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('contribution')
		.setDescription('Print out troubleshooting steps')
        .addSubcommand(subcommand => 
                subcommand
                    .setName('input')
                    .setDescription('Input contribution notice')
        )
            
        .addSubcommand(subcommand => 
                subcommand
                    .setName('general')
                    .setDescription('General contribution notice')
        ),
	async execute(interaction) {
        var msg = ""
        var files = [];
        if (interaction.options.getSubcommand() === 'input') {
           msg = "Please contribute your edits or suggestions directly using GitHub: <https://github.com/offalynne/Input/tree/docs/docs>";
           files.push(new AttachmentBuilder('./assets/contribution.png', {name: 'contribution.png'}));
        } else {
            msg = "Please follow along with the contribution guidelines of the specified resource. If none are specified, please ask the author for the contribution guidelines.";
        }
		
        return interaction.reply({content: msg, files});
	},
};