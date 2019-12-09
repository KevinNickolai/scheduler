/**
 * Abstract class defining a base event that
 * will handle logic for managing scheduled events
 * */
class ScheduleEvent {

	/**
	 * constructor for a ScheduleEvent
	 * @param {string} name The name of the event
	 * @param {Date} date The date of the event
	 */
	constructor(name = 'default event name', date = new Date()) {

		//disables ScheduleEvent instantiation, making it abstract
		if (new.target === ScheduleEvent) {
			throw new TypeError("Cannot instantiate abstract ScheduleEvent class");
		}

		//require override of method displayEvent()
		if ((typeof this.displayEvent) != "function") {
			throw new TypeError("Must override method displayEvent()");
		}

		this.name = name;
		this.date = date;
		this.timeout;

		this.users = new Map();
	}
}

/**
 * Add a user to the event
 * @param {Discord.User} user The discord user to add to the event
 */
ScheduleEvent.prototype.addUser = function (user) {

	//if the user attempting to join isn't already in the event
	if (!this.users.has(user.id)) {
		this.users.set(user.id, user);
		user.send(`You have joined event ${this.name}.`);
	} else {
		user.send(`You've already joined event ${this.name}!`);
	}
}


/**
 * readd a user to the event
 * @param {Discord.User} user the user to readd to the event.
 */
ScheduleEvent.prototype.readdUser = function (user) {
	this.users.set(user.id, user);
}

/**
 * Remove a user from the event.
 * @param {Discord.User} user The user attempting to leave the event
 */
ScheduleEvent.prototype.removeUser = function (user) {
	const success = this.users.delete(user.id);

	success ? user.send(`You have left event ${this.name}.`) : user.send(`You never joined event ${this.name}!`);
}

/**
 * Clear the event's timeout function for firing
 * */
ScheduleEvent.prototype.clearEventTimeout = function () {
	if (this.timeout) {
		clearTimeout(this.timeout);
	}
}

/**
 * Fire the event to start it
 * */
ScheduleEvent.prototype.fire = function () {
	this.users.forEach(user => {
		user.send(`Event ${this.name} fired!`);
	});
}

module.exports = ScheduleEvent;