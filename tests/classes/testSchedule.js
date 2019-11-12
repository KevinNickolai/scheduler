const Discord = require('discord.js');

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

		const user = new Discord.User(client, {
			id: '145786944297631745',
			username: 'Aug',
			discriminator: '3876',
			avatar: '440d4e25dfb2a9d72b062cb40827a6c9',
			bot: false,
			lastMessageID: '643341902271479838',
			lastMessage: {
				channel: {
					type: 'text',
					deleted: false,
					id: '605626914857549835',
					name: 'events',
					position: 4,
					parentID: '542147425578516494'
				},
				topic: '',
				nsfw: false,
				lastMessageID: '643341902271479838',
				lastPinTimestamp: null,
				rateLimitPerUser: 0,
				guildId: '542147425578516492'
			},
			deleted: false,
			id: '643341902271479838',
			type: 'DEFAULT',
			content: '!join 311',
			member: {
				joinedTimestamp: 1549465638043,
				serverDeaf: false,
				serverMute: false,
				selfMute: false,
				selfDeaf: false,
				voiceSessionID: 'b7b55e064b0b836a2a4c86fa2b495582',
				voiceChannelID: '542150411109400577',
				speaking: false,
				nickname: null,
				lastMessageID: '643341902271479838',
				deleted: false
			},
			pinned: false,
			tts: false,
			nonce: '643341903915384832',
			system: false,
			embeds: [],
			createdTimestamp: 1573455062216,
			editedTimestamp: null,
			mentions: {
				everyone: false,
				_content: '!join 311',
				_members: null,
				_channels: null
			},
			webhookID: null,
			hit: null,
			_edits: []
		});

		describe('#joinEvent()', function () {

			const schedule = new scheduleClass(channelId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			var event;
			
			var eventId;

			beforeEach(function () {

				//create a new event 
				event = new autofireEventClass('test-event', eventDate);

				eventId = schedule.addEvent(event);

				//verify no users in the event
				assert.lengthOf(event.users, 0);

				user.messageError = '';
			});

			it('joins a single event for a given user', function () {

				schedule.joinEvent(user, eventId);

				assert.lengthOf(event.users, 1);

			});

			it('fails to join an event', function () {

				const failedEventId = -1;

				schedule.removeEvent(failedEventId);

				schedule.joinEvent(user, failedEventId);

				assert.lengthOf(event.users, 0);

				assert.strictEqual(user.messageError, `Event with ID ${failedEventId} does not exist.`);
			});

			afterEach(function () {
				schedule.clearEvents();
			});

		});

		describe('#leaveEvent()', function () {

			const schedule = new scheduleClass(channelId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			var event;

			var eventId;

			

			beforeEach(function () {
				//create a new event 
				event = new autofireEventClass('test-event', eventDate);

				eventId = schedule.addEvent(event);

				schedule.joinEvent(user, eventId);

				assert.lengthOf(schedule.events, 1);
				assert.lengthOf(event.users, 1);

				user.messageError = '';
			});

			it('removes a user from an event', function () {

				schedule.leaveEvent(user, eventId);

				assert.lengthOf(event.users, 0);

			});

			it('fails to remove user from event that was not joined', function () {

				const failedEventId = -1;

				schedule.leaveEvent(user, failedEventId);

				assert.lengthOf(event.users, 1);

				assert.strictEqual(user.messageError, `Event with ID ${failedEventId} does not exist.`);

			});

			afterEach(function () {
				schedule.clearEvents();
			});

		});

		//describe('#setEventTimer()');

		//describe('#isFull()');

		//describe('#generateEventId()');

		//describe('#display();');
	});

}