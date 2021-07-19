import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";
import { Schedule } from "../classes/schedule";

module.exports = {
	name: 'leave',
	description: "Leave an event.",
	usage: "event-ID",
	args: true,
	serverUnique: true,
	execute(message: Discord.Message, args: string[]) {
		//TODO: find the event of the given name/id
		//and attempt to leave that event.

		const eventId = parseInt(args.shift()!);

		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId)!;

		//eventId is a number
		if (!(isNaN(eventId))) {
			schedule.leaveEvent(message.author, eventId);
			if (schedule.events.get(eventId)!.users.size === 0) {
				schedule.removeEvent(eventId);
			}
		} else {
			message.reply(`Invalid event ID provided.`);
		}
	}
}