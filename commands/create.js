const eventCreator = require('../classes/scheduleEvent.js');
const autofireCreator = require('../classes/autofireEvent.js');

module.exports = {
	name: 'create',
	aliases: ['add', 'cmds'],
	description: "Add an event to the schedule.",
	usage: "<command name> event-type event-name date time",
	args: true,
	execute(message, args) {

		const { schedule } = message.client;

		console.log(schedule);

		const autofire = new autofireCreator();

		const eventId = schedule.addEvent(autofire);

		//failed
		if (eventId === -1) {
			return message.reply("failed to add the event to the schedule.");
		}

		message.reply(`Added the event with ID ${eventId} to the schedule.`);
		//TODO: create the event, store in database
	}
}