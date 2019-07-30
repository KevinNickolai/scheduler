module.exports = {
	name: 'join',
	description: "Join an event.",
	usage: "event-ID",
	args: true,
	serverUnique: true,
	execute(message, args) {
		//TODO: find the event of the given name OR id,
		//and join that event

		const eventId = parseInt(args.shift());

		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		//eventId is a number
		if (!(isNaN(eventId))) {
			schedule.joinEvent(message.author, eventId);
		} else {
			message.reply(`Invalid event ID provided.`);
		}
	}
}