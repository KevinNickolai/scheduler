const ScheduleEvent = require('./scheduleEvent.js');

class AutofireEvent extends ScheduleEvent {
	constructor(name, date, time) {
		super(name, date, time);
	}
}

/**
 * Display the autofire event information
 * @returns {string} the event displayed in a proper format.
 * */
AutofireEvent.prototype.displayEvent = function () {
	return `${this.name}, autofiring on ${this.date} at ${this.time}`;
}

module.exports = AutofireEvent;