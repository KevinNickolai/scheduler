const scheduleClass = require('../../classes/schedule.js');
const autofireEventClass = require('../../classes/autofireEvent.js');

const chai = require('chai');

const assert = chai.assert;

module.exports = (client, channelId) => {

	describe('Schedule', function () {

		describe('#constructor()', function () {

			it('creates an empty schedule object', function () {

				//create a schedule object
				const newSchedule = new scheduleClass(channelId);

				//verify the base constructor properties
				assert.exists(newSchedule.events);
				assert.strictEqual(newSchedule.channelId, channelId);

			});

		});

		describe('#addEvent()', function () {

			const schedule = new scheduleClass(channelId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			const event = new autofireEventClass('test-event', eventDate);

			it('add a single event to the schedule', function () {

				assert.lengthOf(schedule.events, 0);

				const eventId = schedule.addEvent(event);

				/**
				 * verify the eventId and schedule both show an event was added
				 */
				assert.notStrictEqual(eventId, -1);
				assert.hasAllKeys(schedule.events, eventId);
				assert.lengthOf(schedule.events, 1);
			});

			it('adds events to the schedule until full', function () {

				assert.lengthOf(schedule.events, 1);

				var eventId = schedule.addEvent(event);

				do {
					assert.hasAnyKeys(schedule.events, eventId);
					eventId = schedule.addEvent(event);
				} while (eventId !== -1);

				//assure we've obtained the full condition
				assert.strictEqual(eventId, -1);
				assert.lengthOf(schedule.events, schedule.maxEvents());
			});

		});

		describe('#removeEvent()', function () {
			const schedule = new scheduleClass(channelId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			const event = new autofireEventClass('test-event', eventDate);

			var eventIdArray = [];

			const eventsToAdd = 10;

			beforeEach(function () {
				//add events to the schedule before each test
				for (i = 0; i < eventsToAdd; ++i) {
					eventIdArray.push(schedule.addEvent(event));
				}

				assert.lengthOf(schedule.events, eventsToAdd);
				assert.lengthOf(eventIdArray, eventsToAdd);
			});

			it('removes one event from the schedule', function () {

				assert.lengthOf(eventIdArray, eventsToAdd);

				const idToRemove = eventIdArray.shift();

				assert.lengthOf(eventIdArray, eventsToAdd - 1);

				assert.isTrue(schedule.removeEvent(idToRemove));

				assert.lengthOf(schedule.events, eventIdArray.length);

			});

			it('removes all events from the schedule', function () {

				assert.lengthOf(eventIdArray, eventsToAdd);

				while (eventIdArray.length > 0) {
					const idToRemove = eventIdArray.shift();

					assert.lengthOf(eventIdArray, schedule.eventCount() - 1);

					assert.isTrue(schedule.removeEvent(idToRemove));

					assert.lengthOf(schedule.events, eventIdArray.length);
				}

				assert.lengthOf(schedule.events, 0);
				
			});

			it('fails to remove nonexistent element', function () {

				while (eventIdArray.length > 0) {
					schedule.removeEvent(eventIdArray.shift());
				}

				//empty the schedule before attempting removal of a nonexistent event
				assert.lengthOf(schedule.events, 0);

				assert.isFalse(schedule.removeEvent(1));

				assert.lengthOf(schedule.events, 0);
			});

			afterEach(function () {
				//clear events after each test
				schedule.clearEvents();
				eventIdArray = [];
			});
		});

		describe('#joinEvent()', function () {

			const schedule = new scheduleClass(channelId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			var event;

			const user = {
				id: '145786944297631745',
				username: 'Aug',
				discriminator: '3876',
				avatar: '440d4e25dfb2a9d72b062cb40827a6c9',
				bot: false,
			}

			var eventId;

			beforeEach(function () {

				//create a new event 
				event = new autofireEventClass('test-event', eventDate);

				eventId = schedule.addEvent(event);
			});

			it('joins a single event for a given user', function () {

				assert.lengthOf(

			});

			afterEach(function () {
				schedule.clearEvents();
			});

		});
	});

}