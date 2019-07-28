const maxScheduleDays = 30;
const maxEvents = 100;

/**
 * A class that describes a schedule, to track and
 * maintain all of the events within the schedule.
 * */
class Schedule {
	constructor() {
		this.events = new Map();
	}
}

/**
 * Add an event to the schedule
 * @param {ScheduleEvent} event The event to add to the schedule
 * @returns {number} the ID of the event added, -1 if unsuccessful to add
 */
Schedule.prototype.addEvent = function (event) {
	
	if (this.isFull()) {
		return -1;
	}

	const eventId = this.generateEventId();

	this.events.set(eventId, event);

	console.log(`Added event with ID ${eventId} to the schedule.`);

	return eventId;
}

/**
 * Remove an event from the schedule
 * @param {number} eventID The ID of the event to remove
 * @returns {boolean} true if removed successfully, false otherwise
 */
Schedule.prototype.removeEvent = function (eventID) {
	return this.events.delete(eventID);
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

	var scheduleString = "```";

	this.events.forEach((event, id) => {
		scheduleString += `EventID ${id}: ` + event.displayEvent() + '\n';
	});

	scheduleString += "```";
	return scheduleString;
}

module.exports = Schedule;