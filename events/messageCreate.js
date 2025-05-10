const { Events, MessageFlags } = require('discord.js');
const linkHandle = require('../src/link-handling-gist.js');
const Emotes = [
    `🍳`,
    `🔪`,
    `🍴`,
    `🍪`,
    '👍',
    '👌',
    '☕'
]
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if (message.author == message.client.user.id) {
            return;
        }

        if (message.mentions.has(message.client.user.id) && (!message.mentions.everyone)) {
            let emotePos = Math.floor(Math.random() * Emotes.length)
            await message.react(`👨‍🍳`);
            await message.react(Emotes[emotePos]);
        } 
        
        await handleLinkSnippets(message);
    }
}

async function handleLinkSnippets(message) {
    var msg = message.content;
    const githubMatch = [...msg.matchAll(
        /https?:\/\/github\.com\/([a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/blob\/(.+?)\/(.+?)#L(\d+)[-~]?L?(\d*)/g
    )];
    const gitlabMatch = [...msg.matchAll(
        /https?:\/\/gitlab\.com\/([a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/-\/blob\/(.+?)\/(.+?)#L(\d+)-?(\d*)/g
    )];
    const gistMatch = [...msg.matchAll(
        /https?:\/\/gist\.github\.com\/([a-zA-Z0-9-_]+\/[0-9a-zA-Z]+)\/?([0-9a-z]*)\/*#file-(.+?)-L(\d+)[-~]?L?(\d*)/g
    )];
    if (githubMatch.length > 0 || gitlabMatch.length > 0 || gistMatch.length > 0) {
        var results = [];
        let result;
        if (githubMatch.length > 0) {
            for(match of githubMatch) {
                result = await linkHandle(match, "Github");
                results.push(result);
            }
        }
        if (gitlabMatch.length > 0) {
            for(match of gitlabMatch) {
                result = await linkHandle(match, "Gitlab");
                results.push(result);
            }
        }
        if (gistMatch.length > 0) {
            for(match of gistMatch) {
                result = await linkHandle(match, "Gist");
                results.push(result);
            }
        }
        
        // Handle the actual response
        var response = "";
        for(resultMatch of results) {
            if (resultMatch == null) {
                // Do nothing;
                continue;
            }
            response += "```" + resultMatch.extension + `\n${resultMatch.toDisplay}\n` + "```\n";
        }

        if (response.length <= 2000) {
            await message.reply({content: response, allowedMentions: {repliedUser: false}});
        } else {
            for(resultMatch of results) {
                if (resultMatch == null) {
                    // Do nothing;
                    continue;
                }
                response = "```" + resultMatch.extension + `\n${resultMatch.toDisplay}\n` + "```\n";

                if (response.length > 2000) {
                 await message.reply({content: `Result too long: <${resultMatch.url}>`, allowedMentions: {repliedUser: false}});
                } else {
                    await message.reply({content: response, allowedMentions: {repliedUser: false}});
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}