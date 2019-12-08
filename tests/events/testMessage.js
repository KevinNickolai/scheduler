const newMessage = require('../instantiateMessage.js');

module.exports = (client, assert, correctChannel, wrongChannel) => {

	describe('Test Message Event', () => {

		const schedule = client.scheduler.get(correctChannel.guildId);
		const createEventContent = 'create event 1';
		client.messageError = '';

		/**
		 * Testing the creation of the spoofed message
		 */
		it('message creation', async function () {
			try {
				const testMessage = newMessage(createEventContent, client, correctChannel);
			} catch (error) {
				assert.fail(error);
				console.log(error);
			}
		});

		/**
		 * Assure the client is emitting messages appropriately
		 */
		it('successful message emission', async function () {
			//no events in the schedule
			assert.strictEqual(schedule.eventCount(), 0);

			const correctMessage = newMessage(createEventContent, client, correctChannel);

			//client.emit is true if there is listener(s) for the event
			assert.isTrue(await client.emit('message', correctMessage));

			//event successfully added
			assert.strictEqual(schedule.eventCount(), 1);
		});

		/**
		 * Fails to process message when a message has no prefix
		 */
		it('deny message with no prefix', function () {
			assert.strictEqual(schedule.eventCount(), 0);

			const noPrefixMessage =
				newMessage(
					createEventContent,
					client,
					correctChannel,
					correctChannel.guildId,
					false);

			client.emit('message', noPrefixMessage);

			assert.strictEqual(schedule.eventCount(), 0);

		});

		/**
		 * Fail to process message in an incorrect channel
		 */
		it('deny message in wrong guild channel', function () {

			assert.strictEqual(schedule.eventCount(), 0);

			const wrongChannelMessage = newMessage(createEventContent, client, wrongChannel);
			client.emit('message', wrongChannelMessage);

			assert.strictEqual(schedule.eventCount(), 0);
		});

		it('deny message with no valid command', function () {
			const noCommandMessage = newMessage('notacommand', client, correctChannel);

			//the error given to the client when a message command does not exist
			noCommandError = "No command 'notacommand' exists.";

			//check the error message isn't the command error before hand
			assert.notStrictEqual(client.messageError, noCommandError);

			client.emit('message', noCommandMessage);

			assert.strictEqual(client.messageError, noCommandError);
		});

		it('deny message lacking arguments for command', function () {

			const noArgMessage = newMessage('create', client, correctChannel);

			noArgError = "You must provide arguments for the create command.";

			//check error message beforehand to verify no arg error already exists
			assert.notStrictEqual(client.messageError, noArgError);

			client.emit('message', noArgMessage);

			assert.strictEqual(client.messageError, noArgError);

		});

		it('deny server unique message in DM');

		afterEach(function () {
			client.scheduler.forEach((schedule) => {
				schedule.clearEvents();
			});
		});
	});

}