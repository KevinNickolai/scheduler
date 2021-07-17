import { CalendarType } from "../classes/schedule";

module.exports = {
	name: 'calendar',
	aliases: ['cal'],
	description: "Display the schedule calendar.",
	usage: "calendar me|all|eventType",
	args: false,
	serverUnique: true,
	execute(message, args) {

		let calType = CalendarType.me;

		if (args.length >= 1) {
			switch (args.shift()) {
				case "all":
					calType = CalendarType.all;
					break;
				case "me":
				default:
					calType = CalendarType.me;
					break;
			};
		}

		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);
		const user = message.author;

		let cal = schedule.calendar(user, calType);

		message.reply('\n```' + cal + '```');
		
	}
}