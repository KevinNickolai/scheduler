const eventCreator = require('../classes/scheduleEvent.js');
const autofireCreator = require('../classes/autofireEvent.js');

/**
 * Parse the day, and factor that into the date for the created event
 * @param {Date} date A date object describing the date of the event
 * @param {string} day a string indicating the day we want to set the event for
 */
function parseDate(date, day, time) {

	const dayInt = parseInt(day);

	/*
	 * Parse the day given by the user
	 */
	if (isNaN(dayInt)) {

		//The current day of the week, indexed at 1 for sunday ... 7 for saturday
		const dayOfWeek = date.getDay() + 1;

		//the name of the day, lowercase
		day = day.toLowerCase();

		//difference in the day number
		var diff;

		switch (day) {

			case 'today':
				diff = 0;
				break;

			case 'tomorrow':
			case 'tom':
				diff = 1;
				break;

			case 'sunday':
			case 'sun':
				diff = 7 - dayOfWeek + 1; 
				break;

			case 'monday':
			case 'mon':
				diff = (dayOfWeek > 2 ? 7 - dayOfWeek + 2 : 2 - dayOfWeek);
				console.log(diff);
				break;

			case 'tuesday':
			case 'tues':
				diff = (dayOfWeek > 3 ? 7 - dayOfWeek + 3 : 3 - dayOfWeek);
				break;

			case 'wednesday':
			case 'wed':
				diff = (dayOfWeek > 4 ? 7 - dayOfWeek + 4 : 4 - dayOfWeek);
				break;

			case 'thursday':
			case 'thurs':
			case 'thu':
				diff = (dayOfWeek > 5 ? 7 - dayOfWeek + 5 : 5 - dayOfWeek);
				break;

			case 'friday':
			case 'fri':
				diff = (dayOfWeek > 6 ? 7 - dayOfWeek + 6 : 6 - dayOfWeek);
				break;

			case 'saturday':
			case 'sat':
				diff = 7 - dayOfWeek;
				break;
		}

		date.setDate(date.getDate() + diff);

	} else if (dayInt < 0 || dayInt > 30) {
		console.log(`Invalid date ${dayInt} given`);
		return;
	} else if (dayInt < 1) {
		date.setSeconds(date.getSeconds() + 15);
	} else {
		date.setDate(date.getDate() + dayInt);
	}

	if (time) {

		const splitTime = time.split(':', 3);

		const timeInt = parseInt(time);

		if (splitTime.length > 1) {

			if (splitTime.length > 3) {
				console.log(`Invalid time ${time} given.`);
				return;
			} else if (splitTime.length > 1) {

				const hours = splitTime.shift();
				const minutes = splitTime.shift();
				const seconds = splitTime.shift();

				if (hours > 12 || hours < 0) {
					console.log(`Invalid hour ${hours} given.`);
					return;
				} else {
					date.setHours(hours);
				}

				if (minutes > 59 || minutes < 0) {
					console.log(`Invalid minutes ${minutes} given.`);
					return;
				} else {
					date.setMinutes(minutes);
				}

				if (seconds > 59 || seconds < 0) {
					console.log(`Invalid seconds ${seconds} given.`);
					return;
				} else {
					date.setSeconds(seconds);
				}

		} else if (isNaN(timeInt)) {




			} else {

			}


		} else if (timeInt < 0 || timeInt > 2359) {
			console.log(`Invalid time ${timeInt} given.`);
			return;
		} else {

		}
	}

	return date;

}

module.exports = {
	name: 'create',
	aliases: ['add', 'cmds'],
	description: "Add an event to the schedule.",
	usage: "event-type event-name date time",
	args: true,
	serverUnique: true,
	execute(message, args) {

		if (args.length < 2) {

			const argError = `Create requires at least two arguments of event-name and date.`;

			message.client.messageError = argError;
			return message.author.send(argError);
		}

		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		/*
		 * Process the date & time given by the user
		 */
		var currentDate = new Date();

		const eventName = args.shift();
		const eventDay = args.shift();
		const eventTime = args.shift();

		console.log(eventTime);

		const eventDate = parseDate(currentDate, eventDay, eventTime);

		if (!eventDate) {
			return message.reply(`Invalid event date given: ${eventDay}`);
		}

		/*
		 * Create the event based on user input
		 * TODO: add user customization for event type using args
		 */
		const autofire = new autofireCreator(eventName, eventDate);

		schedule.addEvent(autofire)
			.then((eventId) => {
				//failed
				if (eventId === -1) {
					return message.reply("failed to add the event to the schedule.");
				}

				//message.client.database.addEvent(autofire, eventId, message.guild.id);

				message.reply(`Added event ${eventName} with ID ${eventId} to the schedule, ` +
					`set for ${eventDate.toDateString()} at ${eventDate.toTimeString()}`);
				//TODO: create the event, store in database
			}).catch((error) => {
				console.log(error);
			});


	}
}