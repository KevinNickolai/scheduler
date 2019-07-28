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
			return message.author.send("The provided eventID was not a number.");
		}


		schedule.removeEvent();


		console.log(`removed event ${eventId}`);
	}
}