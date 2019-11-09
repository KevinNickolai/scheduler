const Discord = require('discord.js');
const config = require('../config.js');

/**
 * Create a fake discord message, in order to emit it through the Discord.Client for testing purposes
 * 
 * @param {string} content The content of the message, to test commands
 * @param {Discord.Channel} channel The channel of the emulated message
 * @param {string} guildId the ID of the guild to emulate the message in
 * @param {boolean} prefix Use the correct prefix for bot command messages
 */
function createMessage(content, client, channel, guildId = '606933279060393984', prefix = true) {

	//add prefix before the messages
	if (prefix) {
		content = config.prefix + content;
	}

	return new Discord.Message(channel,
		{
			type: 0,
			tts: false,
			timestamp: '2019-09-23T23:51:38.574000+00:00',
			pinned: false,
			nonce: '625841747506757632',
			mentions: [],
			mention_roles: [],
			mention_everyone: false,
			member:
			{
				roles:
					[],
				premium_since: null,
				nick: null,
				mute: false,
				joined_at: '2019-02-06T15:07:18.043000+00:00',
				hoisted_role: null,
				deaf: false
			},
			id: '625841740758384650',
			embeds: [],
			edited_timestamp: null,
			content: content,
			channel_id: channel.id,
			author:
			{
				username: 'Aug',
				id: '145786944297631745',
				discriminator: '3876',
				avatar: '440d4e25dfb2a9d72b062cb40827a6c9'
			},
			attachments: [],
			guild_id: guildId
		}, client)
}

module.exports = createMessage;
