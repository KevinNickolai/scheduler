const Discord = require('discord.js');

const chai = require('chai');

const assert = chai.assert;

const client = require('../client.js');
const config = require('../config.js');

const correctChannelId = '606934634487611412';
const wrongChannelId = '606985847127932977';

var testGuild1;
var testGuild2;
var correctChannel;
var wrongChannel;

before(function (done) {

	this.timeout(10000);

	Promise.all([
		client.database.Init(config.localDBConfig),
		client.login(config.testBotToken)
	]).then(result => {

			client.scheduler.forEach((schedule, guildId) => {
				client.database.setSchedule(schedule, guildId);
			});

			testGuild1 = client.guilds.get('606933279060393984');
			testGuild2 = client.guilds.get('606933327295021057');

			/*
			* Checking channel existences, for message purposes
			**/
			assert.property(testGuild1, 'channels');

			assert.hasAllKeys(testGuild1.channels, [correctChannelId, wrongChannelId]);

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
			
			correctChannel = testGuild1.channels.get(correctChannelId);
			wrongChannel = testGuild1.channels.get(wrongChannelId);
		})
		.catch(error => {
			return done(error);
		})
		.then(result => {
			done();
		});
});

describe('Start testing', function () {

	it('Test Events',function () {
		require('./events/testMessage.js')(client, assert, correctChannel, wrongChannel);
	});

	it('Test Commands', function () {
		require('./commands/testCreate.js')(client, assert, correctChannel);
	});

	it('Test Classes', function () {
		require('./classes/testSchedule.js')(client, assert, correctChannel.id, testGuild1.id);
		require('./classes/testScheduleEvent.js')(client, assert);
	});
});

after(function (done) {
	//TODO: reset server settings to their defaults; remove channels as necessary
	setTimeout(function () {
		done();
		process.exit();
	}, 250);
});