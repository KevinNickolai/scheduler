const eventCreator = require('../classes/scheduleEvent.js');
const autofireCreator = require('../classes/autofireEvent.js');

/**
 * Parse the day, and factor that into the date for the created event
 * @param {Date} date A date object describing the date of the event
 * @param {string} day a string indicating the day we want to set the event for
 */
function parseDate(date,day) {

	const dayInt = parseInt(day);

	if (isNaN(dayInt)) {
		const dayOfWeek = date.getDay();

		day = day.toLowerCase();

		switch (day) {

			case 'today':
				break;

			case 'tomorrow':
			case 'tom':

				break;

			case 'monday':
			case 'mon':
				break;

			case 'tuesday':
			case 'tues':
				break;

			case 'wednesday':
			case 'wed':
				break;

			case 'thursday':
			case 'thurs':
			case 'thu':
				break;

			case 'friday':
			case 'fri':
				break;

			case 'saturday':
			case 'sat':
				break;

			case 'sunday':
			case 'sun':
				break;
		}


	} else if (dayInt < 0 || dayInt > 30) {
		console.log('Invalid date given');
		return;
	} else {

		date.setDate(date.getDate() + dayInt);

		return date;
	}

}

module.exports = {
	name: 'create',
	aliases: ['add', 'cmds'],
	description: "Add an event to the schedule.",
	usage: "<command name> event-type event-name date time",
	args: true,
	serverUnique: true,
	execute(message, args) {

		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		console.log(schedule);

		var currentDate = new Date();

		const eventName = args.shift();
		const eventDay = args.shift();
		//const eventTime = args.shift();

		const eventDate = parseDate(currentDate, eventDay);

		if (!eventDate) {
			return message.reply(`Invalid event date given: ${eventDay}`);
		}

		const autofire = new autofireCreator(eventName, eventDate);

		const eventId = schedule.addEvent(autofire);

		//failed
		if (eventId === -1) {
			return message.reply("failed to add the event to the schedule.");
		}

		message.reply(`Added event ${eventName} with ID ${eventId} to the schedule, ` +
					  `set for ${eventDate.toDateString()} at ${eventDate.toTimeString()}`);
		//TODO: create the event, store in database
	}
}