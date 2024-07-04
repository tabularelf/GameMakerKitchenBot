const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Octokit } = require("@octokit/rest");
const { githubToken } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('issues-count')
		.setDescription('Gets the GameMaker Bugs repository issues, by milestone!')
		.addStringOption(message => {
			return message
			.setName("milestone")
			.setDescription("The milestone to get")
			.setRequired(false)
		}),
	async execute(interaction) {
		var msg = interaction.options.getString("milestone") ?? "current";

		const octokit = new Octokit({ auth: githubToken });
   		const issues = await octokit.issues.listMilestones({
      		owner: 'yoyogames',
     		 repo: 'gamemaker-bugs',
    	});
		
		let result;

		if (msg === "current") {
			result = issues.data[0];
		} else {
			result = issues.data.find((elm) => {
				return elm.title.includes(msg);
			});
		} 

		const issuesEmbed = new EmbedBuilder()
			.setColor(0x00CC00)
			.setTitle(`${result.title} milestone!`)
			.setDescription(`There are ${result.open_issues + result.closed_issues} total issues. With ${result.open_issues} opened issues, and ${result.closed_issues} closed issues.`)
			.setURL(result.html_url)
			.setTimestamp();

		return interaction.reply({embeds: [issuesEmbed], fetchReply: true});

		//console.log(issues.data[0])

		//return interaction.reply({content: `There are ${result.open_issues + result.closed_issues} total issues. With ${result.open_issues} opened issues, and ${result.closed_issues} closed issues. <${result.html_url}}>`, ephemeral: false});
	},
};