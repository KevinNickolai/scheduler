const newMessage = require('../instantiateMessage.js');

/**
 * Tests the Create Command
 * @param {Discord.Client} client The client connection to discord 
 * @param {Chai.Assert} assert The assert suite for chai
 * @param {Discord.Channel} channel the channel to send messages in
 */
module.exports = (client, assert, channel) => {

	describe('Create Command', () => {

		client.messageError = '';

		it('basic create event', async function () {

			const schedule = client.scheduler.get(channel.guildId);

			assert.strictEqual(schedule.eventCount(), 0);

			const createEventMessage = newMessage('create event 1', client, channel);
			await client.emit('message', createEventMessage);

			assert.strictEqual(schedule.eventCount(), 1);
		});

		it('deny event creation lacking necessary args', async function () {
			const createEventFailMessage = newMessage('create event', client, channel);

			const lackArgsError = `Create requires at least two arguments of event-name and date.`;

			assert.notStrictEqual(client.messageError, lackArgsError);

			client.emit('message', createEventFailMessage);

			assert.strictEqual(client.messageError, lackArgsError);

		});

		it('create events with day name');

		it('create events with different times');

		afterEach(function () {
			client.scheduler.forEach((schedule) => {
				schedule.clearEvents();
			});
		});
	});

}