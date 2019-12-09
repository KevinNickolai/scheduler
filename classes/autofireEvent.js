const ScheduleEvent = require('./scheduleEvent.js');

/**
 * Class that describes a Schedule Event that will fire at a specific datetime
 * */
class AutofireEvent extends ScheduleEvent {

	/**
	 * AutofireEvent Constructor
	 * @param {string} name the name of the event
	 * @param {Date} date the date the event will fire
	 */
	constructor(name, date) {
		super(name, date);
	}
}

/**
 * Display the autofire event information
 * @returns {string} the event displayed in a proper format.
 * */
AutofireEvent.prototype.displayEvent = function () {
	return `${this.name}, autofiring on ${this.date.toDateString()} at ${this.date.toTimeString()} with ${this.users.size} member(s).`;
}

module.exports = AutofireEvent;