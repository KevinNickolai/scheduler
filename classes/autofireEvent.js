const ScheduleEvent = require('./scheduleEvent.js');

class AutofireEvent extends ScheduleEvent {
	constructor(name, date) {
		super(name, date);
	}
}

/**
 * Display the autofire event information
 * @returns {string} the event displayed in a proper format.
 * */
AutofireEvent.prototype.displayEvent = function () {
	return `${this.name}, autofiring on ${this.date.toDateString()} at ${this.date.toTimeString()}`;
}

module.exports = AutofireEvent;