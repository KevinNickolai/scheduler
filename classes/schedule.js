const maxScheduleDays = 30;
const maxEvents = 100;

/**
 * A class that describes a schedule, to track and
 * maintain all of the events within the schedule.
 * */
class Schedule {

	/**
	 * Schedule Constructor
	 * @param {string} channelId The ID of the channel that the schedule will receive commands in
	 */
	constructor(channelId) {
		this.events = new Map();
		this.channelId = channelId;
	}


}

/**
* Add an event to the schedule
* @param {ScheduleEvent} event the event to add to the schedule
* @param {number} eventId the ID of the event to add to the schedule
* @returns {number} the ID of the event added, -1 if unsuccessful to add
*/
Schedule.prototype.add = function (event, eventId){
	if (this.isFull()) {
		return -1;
	}

	if (this.events.has(eventId)) {
		console.log(`ID ${eventId} in schedule with channelId ${this.channelId} already exists.`);
		return -1;
	}

	this.events.set(eventId, event);

	this.setEventTimer(eventId);

	//console.log(`Added event with ID ${eventId} to the schedule.`);

	return eventId;
}

/**
 * Add an event to the schedule
 * @param {ScheduleEvent} event The event to add to the schedule
 * @returns {number} the ID of the event added, -1 if unsuccessful to add
 */
Schedule.prototype.addEvent = function (event) {
	return this.add(event, this.generateEventId());
}


/**
 * Add an event that already exists to the schedule
 * @param {ScheduleEvent} event The event to add to the schedule
 * @param {number} eventId The ID of the event added
 * @returns {number} the ID of the event added, -1 if unsuccessful to add
 */
Schedule.prototype.readdEvent = function (event, eventId) {
	return this.add(event, eventId);
}

/**
 * Remove an event from the schedule
 * @param {number} eventID The ID of the event to remove
 * @returns {boolean} true if removed successfully, false otherwise
 */
Schedule.prototype.removeEvent = function (eventID) {

	if (this.events.has(eventID)) {
		this.events.get(eventID).clearEventTimeout();
	}

	return this.events.delete(eventID);
}

/**
 * join an event on the schedule
 * @param {Discord.User} user The discord user that is joining the event
 * @param {number} eventId The ID of the event that the user is joining
 */
Schedule.prototype.joinEvent = function (user, eventId) {

	//console.log(user);

	const event = this.events.get(eventId);

	//check the existence of the event
	if (event) {
		event.addUser(user);
	} else {

		const error = `Event with ID ${eventId} does not exist.`;

		user.messageError = error;
		user.send(error);
	}
}

/**
 * Leave an event on the schedule
 * @param {Discord.User} user The user attempting to leave the event
 * @param {number} eventId The ID of the event to leave
 */
Schedule.prototype.leaveEvent = function (user, eventId) {
	const event = this.events.get(eventId);

	if (event) {
		event.removeUser(user);
	} else {

		const error = `Event with ID ${eventId} does not exist.`;

		user.messageError = error;

		user.send(error);
	}
}

/**
 * Set the timer for an event in the schedule to fire
 * @param {number} eventId The ID of the event to set the timer for
 */
Schedule.prototype.setEventTimer = function (eventId) {

	const event = this.events.get(eventId);

	const timeToWait = event.date.getTime() - Date.now();

	if (timeToWait <= 0) {
		//do immediately
		this.fireEvent(eventId);

	} else if (timeToWait <= 86400000) {
		//settimeout

		const that = this;

		event.timeout = setTimeout(function () {
			that.fireEvent(eventId)
		}, timeToWait);

	} else {
		//wait
	}
}

/**
 * flag to indicate if the schedule is full
 * @returns {boolean} true if schedule full, false otherwise
 * */
Schedule.prototype.isFull = function () {
	return (this.events.size >= maxEvents);
}

/**
 * Generate a random ID for the event
 * @returns {number} the generated event ID
 * */
Schedule.prototype.generateEventId = function () {
	
	var randomId;

	do {
		randomId = Math.floor(Math.random() * 999) + 1;
	} while (this.events.has(randomId));

	return randomId;
}

/**
 * Display the schedule
 * @returns {string} the schedule's events, formatted to display on Discord
 * */
Schedule.prototype.display = function () {

	if (this.events.size === 0) {
		return "```The schedule is currently empty.```";
	}

	var scheduleString = "```";

	this.events.forEach((event, id) => {
		scheduleString += `EventID ${id}: ` + event.displayEvent() + '\n';
	});

	scheduleString += "```";
	return scheduleString;
}

/**
 * Fire the event of the given eventId
 * @param {number} eventId The ID associate to the event in the schedule
 */
Schedule.prototype.fireEvent = function (eventId) {
	this.events.get(eventId).fire();
	this.removeEvent(eventId);


	/*
	 * Remove the event from the client database
	 */
}

/**
 * Get the number of events currently in the schedule
 * @returns {number} the number of events currently in the schedule
 * */
Schedule.prototype.eventCount = function () {
	return this.events.size;
}

/**
 * Clear the schedule of all events
 * */
Schedule.prototype.clearEvents = function () {
	this.events.clear();
}

/**
 * Get the maximum number of events possible in the schedule
 * @returns {number} the limit of events that can be in the schedule at once
 * */
Schedule.prototype.maxEvents = function () {
	return maxEvents;
}

module.exports = Schedule;