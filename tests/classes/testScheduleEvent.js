const ScheduleEvent = require('../../classes/scheduleEvent.js');
const chai = require('chai');

const assert = chai.assert;
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
 * MockErrorScheduleEvent will throw an error on instantiation,
 * to assure that necessary functions are overridden
 * */
class MockErrorScheduleEvent extends ScheduleEvent {
	constructor(name, date) {
		super(name, date);
	}
}

describe('Test ScheduleEvent', function () {

	describe('#constructor()', function () {

		const eventName = 'test-event';
		const eventDate = new Date();
		eventDate.setDate(eventDate.getDate() + 1);

		function mockConstructor() {

			new MockScheduleEvent(eventName, eventDate);

		}


		it('creates a basic class inheirited from ScheduleEvent', function () {

			assert.throws(mockConstructor, 'Must override method displayEvent()');
		});

	});

});