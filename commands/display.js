module.exports = {
	name: 'display',
	aliases: ['schedule', 'show', 'events'],
	description: "Display the schedule.",
	usage: "<command name>",
	serverUnique: true,
	execute(message, args) {
		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		message.reply(schedule.display());
	}
}