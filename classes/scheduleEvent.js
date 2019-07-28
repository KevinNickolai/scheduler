/**
 * Abstract class defining a base event that
 * will handle logic for managing scheduled events
 * */
class ScheduleEvent {

	/**
	 * constructor for a ScheduleEvent
	 * @param {string} name The name of the event
	 * @param {Date} date The date of the event
	 * @param {string} time The time of the event 
	 */
	constructor(name = 'default event name', date = new Date()) {
		if (new.target === ScheduleEvent) {
			throw new TypeError("Cannot instantiate abstract ScheduleEvent class");
		}

		if ((typeof this.displayEvent) != "function") {
			throw new TypeError("Must override method displayEvent()");
		}

		this.name = name;
		this.date = date;

		this.users = [];
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