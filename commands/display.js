module.exports = {
	name: 'display',
	aliases: ['schedule', 'show', 'events'],
	description: "Display the schedule.",
	usage: "<command name>",
	execute(message, args) {
		const { schedule } = message.client;

		message.reply(schedule.display());
	}
}