const Discord = require('discord.js');

const chai = require('chai');

const assert = chai.assert;

const client = require('../client.js');
const config = require('../config.js');

var testGuild1;
var testGuild2;

const correctChannelId = '606934634487611412';
const wrongChannelId = '606985847127932977';

var correctChannel;
var wrongChannel;

/**
 * Create a fake discord message, in order to emit it through the Discord.Client for testing purposes
 * 
 * @param {string} content The content of the message, to test commands
 * @param {Discord.Channel} channel The channel of the emulated message
 * @param {string} guildId the ID of the guild to emulate the message in
 * @param {boolean} prefix Use the correct prefix for bot command messages
 */
function createMessage(content, channel, guildId = '606933279060393984', prefix = true) {

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
					['542158163235831826',
						'612827457724350494',
						'542147772942385159'],
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

describe('Test Message Event', () => {

	before(async () => {
		await client.login(config.testBotToken);
		testGuild1 = client.guilds.get('606933279060393984');
		testGuild2 = client.guilds.get('606933327295021057');

		/*
		 * Checking channel existences, for message purposes
		 **/
		assert.property(testGuild1, 'channels');

		assert.hasAllKeys(testGuild1.channels, [correctChannelId, wrongChannelId]);

		correctChannel = testGuild1.channels.get(correctChannelId);
		wrongChannel = testGuild2.channels.get(wrongChannelId);

		assert.property(client, 'guilds');
		assert.lengthOf(client.guilds, 2);

		//keys of the two test servers the bot is located in
		assert.hasAllKeys(client.guilds, [testGuild1.id, testGuild2.id]);

		//assert the bot's user ID is correct
		assert.isTrue(client.user.id === '606933041553866775');

		client.guilds.forEach((guild) => {

			assert.property(guild, 'members');
			assert.lengthOf(guild.members, 2);

			assert.hasAllKeys(guild.members,
				['145786944297631745',		//< User to interact with test messages
					'606933041553866775']);	//< the bot running on the server

		});
	});

	it('Test emitted message creation', async function () {
		try {
			const testMessage = createMessage('create event 1', correctChannel);
		} catch (error) {
			console.log(error);
		}
	});

	it('Test message emission', async function () {
		const correctMessage = createMessage('create event 1', correctChannel);
		client.emit('message', correctMessage);
	});

	after(function () {
		//TODO: reset server settings to their defaults; remove channels as necessary
		//process.exit();
	});
});

	