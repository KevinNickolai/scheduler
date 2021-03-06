﻿const maxScheduleDays = 30;
const maxEvents = 100;

/**
 * A class that describes a schedule, to track and
 * maintain all of the events within the schedule.
 * */
class Schedule {

	/**
	 * Schedule Constructor
	 * @param {string} channelId The ID of the channel that the schedule will receive commands in
	 * @param {Discord.Client} client The client that the schedule is managed by
	 */
	constructor(channelId, client, guildId) {
		this.events = new Map();
		this.channelId = channelId;
		this.guildId = guildId;
		this.client = client;
	}


}

/**
* Add an event to the schedule
* @param {ScheduleEvent} event the event to add to the schedule
* @param {number} eventId the ID of the event to add to the schedule
* @param {boolean} updateDatabase flag indicating if the database should be updated to reflect schedule changes
* @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
*/
Schedule.prototype.add = function (event, eventId, updateDatabase = true) {

	//persistent schedule reference for the upcoming promise chain
	const that = this;

	return new Promise((resolve, reject) => {
		if (that.isFull()) {
			return resolve(-1);
		}

		if (that.events.has(eventId)) {
			console.log(`ID ${eventId} in schedule with channelId ${that.channelId} already exists.`);
			return resolve(-1);
		}

		if (updateDatabase) {
			/*
			* Attempt addition of the event to the scheduling database
			*/
			that.client.database.addEvent(event, eventId, that.guildId)
				.then((result) => {
					that.events.set(eventId, event);
					that.setEventTimer(eventId);
					return resolve(eventId);
				}).catch((error) => {
					console.log(error);
					return reject(error);
				});
		} else {
			that.events.set(eventId, event);
			that.setEventTimer(eventId);
			return resolve(eventId);
		}

	});
}

/**
 * Add an event to the schedule
 * @param {ScheduleEvent} event The event to add to the schedule
 * @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
 */
Schedule.prototype.addEvent = function (event) {
	return this.add(event, this.generateEventId());
}


/**
 * Add an event that already exists to the schedule
 * @param {ScheduleEvent} event The event to add to the schedule
 * @param {number} eventId The ID of the event added
 * @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
 */
Schedule.prototype.readdEvent = function (event, eventId) {
	return this.add(event, eventId, false);
}

/**
 * Remove an event from the schedule
 * @param {number} eventId The ID of the event to remove
 * @returns {Promise<boolean>} true if removed successfully, false otherwise
 */
Schedule.prototype.removeEvent = function (eventId) {

	//persistent schedule reference for the upcoming promise chain
	const that = this;

	return new Promise((resolve, reject) => {

		if (that.events.has(eventId)) {

			const event = that.events.get(eventId);

			that.client.database.removeEvent(eventId, that.guildId)
				.then(result => {
					event.clearEventTimeout();

					const deleted = that.events.delete(eventId);
					return resolve(deleted);
				}).catch(error => {
					return reject(false);
				});
		} else {
			return resolve(false);
		}
	});
}

/**
 * join an event on the schedule
 * @param {Discord.User} user The discord user that is joining the event
 * @param {number} eventId The ID of the event that the user is joining
 * @returns {Promise} A promise that resolves when the user has been added to the event
 */
Schedule.prototype.joinEvent = function (user, eventId) {

	return new Promise((resolve, reject) => {
		const event = this.events.get(eventId);

		//check the existence of the event
		if (event) {
			this.client.database.addUser(user, eventId, this.guildId)
				.then((result) => {
					event.addUser(user);
					resolve();
				}).catch((error) => {
					console.log(error);
					reject(error);
				});

		} else {

			const error = `Event with ID ${eventId} does not exist.`;

			user.messageError = error;
			user.send(error);
			resolve();
		}
	});
}

/**
 * rejoin an event on the schedule
 * @param {Discord.User} user The discord user that is rejoining the event
 * @param {number} eventId The ID of the event that the user is rejoining
 */
Schedule.prototype.rejoinEvent = function (user, eventId) {
	const event = this.events.get(eventId);

	event.readdUser(user);
}

/**
 * Leave an event on the schedule
 * @param {Discord.User} user The user attempting to leave the event
 * @param {number} eventId The ID of the event to leave
 * @returns {Promise} A promise that resolves when the user has left the event
 */
Schedule.prototype.leaveEvent = function (user, eventId) {

	return new Promise((resolve, reject) => {

		const event = this.events.get(eventId);

		if (event) {

			this.client.database.removeUser(user, eventId, this.guildId)
				.then((result) => {
					event.removeUser(user);
					return resolve();
				}).catch(error => {
					return reject(error);
				});
		} else {

			const error = `Event with ID ${eventId} does not exist.`;

			user.messageError = error;

			user.send(error);

			return resolve();
		}
	});

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
		this.fireEvent(eventId)
			.then((result) => {
				console.log(`Fired event ${eventId} successfully`);
			}).catch((error) => {
				console.error(error);
			});
	} else if (timeToWait <= 86400000) {
		//settimeout

		const that = this;

		event.timeout = setTimeout(function () {
			that.fireEvent(eventId)
				.then((result) => {
					console.log(`Fired event ${eventId} successfully`);
				}).catch((error) => {
					console.error(error);
				});
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
		scheduleString += `EventID ${id}: ` + event.displayEvent() + '\n\n';
	});

	scheduleString += "```";
	return scheduleString;
}

/**
 * Fire the event of the given eventId
 * @param {number} eventId The ID associate to the event in the schedule
 * @returns {Promise<boolean>} true if the event fired and was removed properly, false otherwise.
 */
Schedule.prototype.fireEvent = function (eventId) {
	this.events.get(eventId).fire();
	
	return this.removeEvent(eventId);
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
 * @returns {Promise} A promise resolving when the schedule is clear of events
 * */
Schedule.prototype.clearEvents = function () {

	const that = this;

	return new Promise((resolve, reject) => {

		//convert the events schedule to a format that will evaluate
		//a promise for each event in the schedule, then resolve when all events are removed
		Promise.all(
			Array.from(that.events, ([eventId, event]) => {
				return that.removeEvent(eventId);
			})
		).then((result) => {
			resolve();
		}).catch((error) => {
			reject(error);
		});
	});
}

/**
 * Get the maximum number of events possible in the schedule
 * @returns {number} the limit of events that can be in the schedule at once
 * */
Schedule.prototype.maxEvents = function () {
	return maxEvents;
}

module.exports = Schedule;