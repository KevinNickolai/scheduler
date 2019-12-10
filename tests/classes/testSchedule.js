const Discord = require('discord.js');

const scheduleClass = require('../../classes/schedule.js');
const autofireEventClass = require('../../classes/autofireEvent.js');

/**
 * Export schedule tests
 * @param {Discord.Client} client the Discord client to be interacted with
 * @param {Chai.Assert} assert the Chai assert library used for assertion testing
 * @param {string} channelId The id of the text channel to be used by the schedule
 * @param {string} guildId The id of the server the schedule manages
 */
module.exports = (client, assert, channelId, guildId) => {

	describe('Schedule', function () {

		describe('#constructor()', function () {

			it('creates an empty schedule object', function () {

				//create a schedule object
				const newSchedule = new scheduleClass(channelId, client, guildId);

				//verify the base constructor properties
				assert.exists(newSchedule.events);
				assert.strictEqual(newSchedule.channelId, channelId);

				assert.strictEqual(client, newSchedule.client);
				assert.strictEqual(newSchedule.guildId, guildId);

			});

		});

		describe('#addEvent()', async function () {

			const schedule = new scheduleClass(channelId,client,guildId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			const event = new autofireEventClass('test-event', eventDate);

			it('add a single event to the schedule', function (done) {

				assert.lengthOf(schedule.events, 0);

				schedule.addEvent(event)
					.then((eventId) => {
						/**
						* verify the eventId and schedule both show an event was added
						*/
						assert.notStrictEqual(eventId, -1);
						assert.hasAllKeys(schedule.events, eventId);
						assert.lengthOf(schedule.events, 1);

						done();
					}).catch((error) => {
						done(error);
					});

				
			});

			it('adds events to the schedule until full', async function () {

				assert.lengthOf(schedule.events, 1);

				var eventId;

				do {
					eventId = await schedule.addEvent(event)
						.then((id) => {
							if (id != -1) {
								assert.hasAnyKeys(schedule.events, id);
							}

							return id;
						});
				} while(eventId !== -1);

				//assure we've obtained the full condition
				assert.strictEqual(eventId, -1);
				assert.lengthOf(schedule.events, schedule.maxEvents());
			});

		});

		describe('#removeEvent()', function () {
			const schedule = new scheduleClass(channelId, client, guildId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			const event = new autofireEventClass('test-event', eventDate);

			var eventIdArray = [];

			const eventsToAdd = 10;

			beforeEach(function (done) {

				//add events to the schedule before each test
				for (i = 0; i < eventsToAdd; ++i) {
					eventIdArray.push(schedule.addEvent(event));
				}

				//assure that all events added to the eventIdArray resolve
				Promise.all(eventIdArray)
					.then((result) => {
						assert.lengthOf(schedule.events, eventsToAdd);
						assert.lengthOf(eventIdArray, eventsToAdd);

						done();
					}).catch((error) => {
						assert.fail();
						done(error);
					});
			});

			it('removes one event from the schedule', function (done) {

				assert.lengthOf(eventIdArray, eventsToAdd);

				const idToRemove = eventIdArray.shift();

				assert.lengthOf(eventIdArray, eventsToAdd - 1);

				idToRemove.then((id) => {
					schedule.removeEvent(id)
						.then((removed) => {
							assert.isTrue(removed);
							assert.lengthOf(schedule.events, eventIdArray.length);
							done();
						}).catch((error) => {
							done(error);
						});
				});

			});

			it('removes all events from the schedule', function (done) {

				assert.lengthOf(eventIdArray, eventsToAdd);

				//map the schedule's events to an array, then await the removal of all events
				//before assertings and finishing the test
				Promise.all(
					Array.from(schedule.events, ([eventId, event]) => {
						return new Promise((resolve, reject) => {
							schedule.removeEvent(eventId)
								.then((result) => {
									resolve(result);
								}).catch((error) => {
									reject(error);
								});
						});
					})
				).then((promises) => {

					//assert that all event promises were removed
					promises.forEach(promise => {
						assert.isTrue(promise);
					});

					assert.lengthOf(schedule.events, 0);

					done();
				}).catch((error) => {
					assert.fail();
					done(error);
				});
			});

			it('fails to remove nonexistent element', function (done) {

				schedule.clearEvents()
					.then((result) => {
						//empty the schedule before attempting removal of a nonexistent event
						assert.lengthOf(schedule.events, 0);

						schedule.removeEvent(1).then((removed) => {
							assert.isFalse(removed);

							assert.lengthOf(schedule.events, 0);

							done();
						}).catch((error) => {
							done(error);
						});

					}).catch((error) => {
						assert.fail();
						done(error);
					});

				
			});

			afterEach(function (done) {

				//clear events after each test
				schedule.clearEvents()
					.then((result) => {
						eventIdArray = [];
						done();
					}).catch((error) => {
						assert.fail();
						done(error);
					});

			});
		});

		const user = new Discord.User(client, {
			id: '145786944297631745',
			username: 'Aug',
			discriminator: '3876',
			bot: false
		});

		describe('#joinEvent()', function () {

			const schedule = new scheduleClass(channelId, client, guildId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			var event;
			
			var eventId;

			beforeEach(function (done) {

				//create a new event 
				event = new autofireEventClass('test-event', eventDate);

				schedule.addEvent(event)
					.then((id) => {
						//verify no users in the event
						assert.lengthOf(event.users, 0);
						assert.lengthOf(schedule.events, 1);

						user.messageError = '';
						eventId = id;
						done();
					}).catch((error) => {
						done(error);
					});
			});

			it('joins a single event for a given user', function (done) {

				schedule.joinEvent(user, eventId)
					.then((result) => {
						assert.lengthOf(event.users, 1);
						done();
					}).catch((error) => {
						assert.fail();
						done(error);
					});

				
			});

			it('fails to join an event', function (done) {

				const failedEventId = -1;

				schedule.removeEvent(failedEventId)
				.then((removed) => {
					schedule.joinEvent(user, failedEventId);

					assert.lengthOf(event.users, 0);

					assert.strictEqual(user.messageError, `Event with ID ${failedEventId} does not exist.`);

					done();
				}).catch((error) => {
					assert.fail();
					done(error);
				});
			});

			afterEach(function (done) {
				schedule.clearEvents().then(done()).catch((error) => done(error));
			});

		});

		describe('#leaveEvent()', function () {

			const schedule = new scheduleClass(channelId, client, guildId);

			//an event one day ahead of the current date
			const eventDate = new Date();
			eventDate.setDate(eventDate.getDate() + 1);

			var event;

			var eventId;

			beforeEach(function (done) {
				//create a new event 
				event = new autofireEventClass('test-event', eventDate);

				schedule.addEvent(event)
					.then((id) => {

						eventId = id;

						return schedule.joinEvent(user, id);
					}).then((result) => {
						assert.lengthOf(schedule.events, 1);
						assert.lengthOf(event.users, 1);

						user.messageError = '';
						done();
					}).catch ((error) => {
						done(error);
					});
			});

			it('removes a user from an event', function (done) {

				//console.log(eventId);
				schedule.leaveEvent(user, eventId)
					.then((result) => {
						assert.lengthOf(event.users, 0);
						done();
					}).catch((error) => {
						done(error);
					});
			});

			it('fails to remove user from event that was not joined', function () {

				const failedEventId = -1;

				schedule.leaveEvent(user, failedEventId)
					.then((result) => {
						assert.lengthOf(event.users, 1);

						assert.strictEqual(user.messageError, `Event with ID ${failedEventId} does not exist.`);

						done();
					}).catch((error) => {
						done(error);
					});



			});

			afterEach(function (done) {
				schedule.clearEvents().then(done);
			});

		});

		//describe('#setEventTimer()');

		//describe('#isFull()');

		//describe('#generateEventId()');

		//describe('#display();');
	});

}