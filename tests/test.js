const Discord = require('discord.js');

const chai = require('chai');

const assert = chai.assert;

const client = require('../client.js');
const config = require('../config.js');

var testGuild1;
var testGuild2;

//Before any test cases, use root suite level describe block
//to set up the client for test cases
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


require('./events/testMessage.js');

require('./testCreate.js');