module.exports = {
	name: 'remove',
	aliases: ['delete'],
	description: "Remove an event from the schedule.",
	usage: "<command name> eventID",
	args: true,
	execute(message, args) {

		const { schedule } = message.client;

		const eventId = parseInt(args.shift());

		if (isNaN(eventId)) {
			return message.reply("The provided eventID was not a number.");
		}

		if (schedule.removeEvent(eventId)) {
			message.reply(`Removed event with ID ${eventId} from the schedule.`);
			console.log(`removed event ${eventId}`);
		} else {
			message.reply(`No event with ID ${eventId} exists.`);
		}
	}
}