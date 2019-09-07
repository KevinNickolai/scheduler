const Discord = require('discord.js');

const chai = require('chai');

const assert = chai.assert;

const client = require('../client.js');
const config = require('../config.js');

var testGuild1;
var testGuild2;

describe('init', () => {
	before(async () => {
		await client.login(config.testBotToken);
		testGuild1 = client.guilds.get('606933279060393984');
		testGuild2 = client.guilds.get('606933327295021057');
	});

	it('verifies server settings beforehand', function() {
		assert.property(client, 'guilds');
		assert.lengthOf(client.guilds, 2);

		//keys of the two test servers the bot is located in
		assert.hasAllKeys(client.guilds, [ testGuild1.id, testGuild2.id ]);

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

	it('test message', async function () {
		assert.property(testGuild1, 'channels');

		/*
		 * Checking channel existences, for message purposes
		 **/
		const correctChannelId = '606934634487611412';
		const wrongChannelId = '606985847127932977';
		assert.hasAllKeys(testGuild1.channels, [correctChannelId, wrongChannelId]);

		const correctChannel = testGuild1.channels.get(correctChannelId);
		const wrongChannel = testGuild2.channels.get(wrongChannelId);

        await correctChannel.fetchMessage('607039502636154961')
            .then(message => {
                client.emit('message',message);
            })
            .catch((error) => {
                console.log(error);
                assert.isTrue(false); //< fail the test here, if error getting message
            });


		//console.log(correctChannel.messages);
		//console.log(client.emit('message', message));
	});

	after(async () => {
		//TODO: reset server settings to their defaults; remove channels as necessary
		process.exit();
	});
});