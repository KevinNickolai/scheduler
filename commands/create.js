const eventCreator = require('../classes/events/scheduleEvent.js');
const autofireCreator = require('../classes/events/autofireEvent.js');
const parseDate = require('../classes/parseDate.js');
const durationCreator = require("../classes/events/durationEvent.js");

module.exports = {
	name: 'create',
	aliases: ['add', 'cmds', 'make', 'c'],
	description: "Add a default-typed event to the schedule.",
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
		const am_pm = args.shift();

		try {

		}
		catch{

		}

		let eventDate = currentDate; 
		if (eventDay === "now") {
			eventDate.setMinutes(eventDate.getMinutes() + 5);
		} else if (eventDay === "later") {
			eventDate.setHours(eventDate.getHours() + 2);
		} else {
			eventDate = parseDate.parseDate(currentDate, eventDay, eventTime, am_pm);
		}

		
		if (!eventDate) {
			return message.reply(`Invalid event date given: ${eventDay}`);
		}

		/*
		 * Create the event based on user input
		 * TODO: add user customization for event type using args
		 */
		const autofire = new autofireCreator.AutofireEvent(message.author, eventName, eventDate);
		const duration = new durationCreator.DurationAutofireEvent(message.author, eventName, eventDate);

		schedule.addEvent(duration)
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