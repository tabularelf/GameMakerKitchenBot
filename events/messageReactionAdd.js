const { Events } = require('discord.js');
const handleGMLCodeBlock = require('../src/handle-gml-code.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }
    
        if (reaction.message.partial) {
          try {
            await reaction.message.fetch();
          } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
          }
        }

        if (user.partial) {
            try {
              await user.fetch();
            } catch (error) {
              console.error('Something went wrong when fetching the message:', error);
              return;
            }
        }

        await handleWandReacts(reaction, user);
        await handleWandForceReacts(reaction, user);
    }
};

async function handleWandReacts(reaction, user) {
    if (reaction.emoji.name !== '🪄') return;
    const message = await reaction.message.fetch();
    await handleGMLCodeBlock(message);
}

async function handleWandForceReacts(reaction, user) {
    if (reaction.emoji.name !== '🪄' && reaction.emoji.name !== '🇫') return;
    const message = await reaction.message.fetch();
    const filter = (reaction) => {return reaction === '🪄' || reaction === '🇫'};
    const reactions = [...message.reactions.cache.keys()].filter(filter);
    if (reactions.length === 2) {
        await handleGMLCodeBlock(message, true);
    }
}