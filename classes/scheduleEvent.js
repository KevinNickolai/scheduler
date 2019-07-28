/**
 * Abstract class defining a base event that
 * will handle logic for managing scheduled events
 * */
class ScheduleEvent {
	constructor(name, date, time) {
		if (new.target === ScheduleEvent) {
			throw new TypeError("Cannot instantiate abstract ScheduleEvent class");
		}

		if ((typeof this.displayEvent) != "function") {
			throw new TypeError("Must override method displayEvent()");
		}

		this.users = [];
		this.name = 'default event';
		this.date = 'default date';
		this.time = 'default time';
		console.log('Event created.');
	}
}

ScheduleEvent.prototype.AddUser = function () {

}

ScheduleEvent.prototype.RemoveUser = function () {

}

ScheduleEvent.prototype.Fire = function () {
	this.users.forEach(user => {
		user.send(`Event ${this.name} fired!`);
	});
}

module.exports = ScheduleEvent;