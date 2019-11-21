const ScheduleEvent = require('../../classes/scheduleEvent.js');
const Discord = require('discord.js');

/**
 * FailedMockScheduleEvent fails to create an object
 * inheiriting from ScheduleEvent, since it leaves out
 * a function required to override
 * */
class FailedMockScheduleEvent extends ScheduleEvent {
	constructor(name, date) {
		super(name, date);
	}
}

/**
 * MockScheduleEvent is used to test the abstract class
 * ScheduleEvent without unnecessary inheiritance
 * */
class MockScheduleEvent extends ScheduleEvent {
	constructor(name, date) {
		super(name, date);
	}
}

/**
 * Required display event function for the MockScheduleEvent
 */
MockScheduleEvent.prototype.displayEvent = function () {}

/**
 * MockErrorScheduleEvent will throw an error on instantiation,
 * to assure that necessary functions are overridden
 * */
class MockErrorScheduleEvent extends ScheduleEvent {
	constructor(name, date) {
		super(name, date);
	}
}

/**
 * Function containing tests for the ScheduleEvent class
 * @param {Discord.Client} client the Discord client interface
 * @param {Chai.Assert} assert Chai's assert testing suite
 */
module.exports = (client, assert) => {

	describe('Test ScheduleEvent', function () {

		const eventName = 'test-event';
		const eventDate = new Date();
		eventDate.setDate(eventDate.getDate() + 1);

		describe('#constructor()', function () {
			
			function failMockConstructor() {
				new FailedMockScheduleEvent(eventName, eventDate);
			}

			function mockConstructor() {
				new MockScheduleEvent(eventName, eventDate);
			}

			function failAbstractInstantiate() {
				new ScheduleEvent(eventName, eventDate);
			}

			it('creates a basic class inheirited from ScheduleEvent', function () {
				assert.doesNotThrow(mockConstructor, 'Must override method displayEvent()');
				const mockEvent = new MockScheduleEvent(eventName, eventDate);

				assert.exists(mockEvent.name);
				assert.exists(mockEvent.date);
				assert.strictEqual(mockEvent.name, eventName);
				assert.strictEqual(mockEvent.date, eventDate);
				assert.exists(mockEvent.users);
			});

			it('fails to create object of class without overriding required function', function () {
				assert.throws(failMockConstructor, 'Must override method displayEvent()');
			});

			it('fails to create object of abstract ScheduleEvent', function () {
				assert.throws(failAbstractInstantiate, 'Cannot instantiate abstract ScheduleEvent class');
			});
		});

		const user = new Discord.User(client, {
			id: '145786944297631745',
			username: 'Aug',
			discriminator: '3876',
			bot: false
		});

		describe('#addUser()', function () {

			var event;

			beforeEach(function () {
				event = new MockScheduleEvent(eventName, eventDate);
			});

			it('adds a user to the event', function () {
				assert.lengthOf(event.users, 0);

				event.addUser(user);

				assert.lengthOf(event.users, 1);
				assert.hasAllKeys(event.users, user.id);
			});

			it('fails to add user already in event', function () {
				assert.lengthOf(event.users, 0);

				event.addUser(user);

				assert.lengthOf(event.users, 1);
				assert.hasAllKeys(event.users, user.id);

				event.addUser(user);

				assert.lengthOf(event.users, 1);
				assert.hasAllKeys(event.users, user.id);
			});

		});

		describe('removeUser()', function () {

			var event;

			beforeEach(function () {
				event = new MockScheduleEvent(eventName, eventDate);
				event.addUser(user);

				assert.lengthOf(event.users, 1);
				assert.hasAllKeys(event.users, user.id);
			});

			it('removes a user from the event', function () {
				event.removeUser(user);

				assert.lengthOf(event.users, 0);
				assert.doesNotHaveAllKeys(event.users, user.id);
			});


		});

		describe('clearTimeout()', function () {
			it('clears the event\'s timeout property');
		});

		describe('#fire()', function () {
			it('fires an event');
		});
	});
}
