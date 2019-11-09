const newMessage = require('../instantiateMessage.js');
const chai = require('chai');

const assert = chai.assert;

module.exports = (client, channel) => {


	describe('Create Command', () => {

		client.messageError = '';

		it('basic create event', async function () {

			const schedule = client.scheduler.get(channel.guildId);

			assert.strictEqual(schedule.eventCount(), 0);

			const createEventMessage = newMessage('create event 1', client, channel);
			client.emit('message', createEventMessage);

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