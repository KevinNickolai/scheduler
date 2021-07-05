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

		//console.log(client);

			client.scheduler.forEach((schedule, guildId) => {
				client.database.setSchedule(schedule, guildId);
			});

			testGuild1 = client.guilds.cache.get('606933279060393984');
			testGuild2 = client.guilds.cache.get('606933327295021057');

			/*
			* Checking channel existences, for message purposes
			*/
			assert.property(testGuild1, 'channels');

			assert.hasAllKeys(testGuild1.channels.cache, [correctChannelId, wrongChannelId]);

			assert.property(client, 'guilds');
			assert.lengthOf(client.guilds.cache, 2);

			//keys of the two test servers the bot is located in
			assert.hasAllKeys(client.guilds.cache, [testGuild1.id, testGuild2.id]);

			//assert the bot's user ID is correct
			assert.isTrue(client.user.id === '606933041553866775');



			
		var promises = client.guilds.cache.mapValues((guild) => {
			return guild.members.fetch();
		});

		//var t = guild.members.fetch();
				//t.then(console.log);
				//assert.strictEqual(2, guild.memberCount);
				//assert.property(guild, 'members');
				//assert.lengthOf(guild.members.cache, 2);
				/*
				assert.hasAllKeys(guild.members,
					['145786944297631745',		//< User to interact with test messages
						'606933041553866775']);	//< the bot running on the server
						*/
			
			correctChannel = testGuild1.channels.cache.get(correctChannelId);
			wrongChannel = testGuild1.channels.cache.get(wrongChannelId);

		return Promise.all(promises);

		})
		.then(result => {
			console.log(result);
			done();
		})
		.catch(error => {
			done(error);
		});
		
});

/*
 * Run all test module tests
 * TODO: modularize all tests to only need client & assert library, or maybe just client.
 */
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
		require('./classes/testParseDate.js')(client, assert);
	});
});

after(function (done) {
	//TODO: reset server settings to their defaults; remove channels as necessary
	setTimeout(function () {
		done();
		process.exit();
	}, 250);
});