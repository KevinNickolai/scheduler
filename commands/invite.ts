import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";
import { Schedule } from "../classes/schedule";

module.exports = {
	name: 'invite',
	aliases: ['inv', 'i'],
	description: "Invite a user to the event..",
	usage: "event-id | event-id @user @role",
	args: true,
	serverUnique: true,
	execute(message: Discord.Message, args: string[]) {

		if (args.length < 2) {

			const argError = `Invite requires at least two arguments of a discord mention and an event-id.`;

			(message.client as SchedulerClient).messageError = argError;
			return message.author.send(argError);
		}

		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId)!;

		let flatMapGuildMembers = (member: Discord.GuildMember, id: string, _: Discord.Collection<string, Discord.GuildMember>): Discord.Collection<string, Discord.GuildMember> => {
			targets.set(id, member);
			return new Discord.Collection<string, Discord.GuildMember>();
		};

		const targets = new Map<string, Discord.GuildMember>();
		message.mentions.members!.flatMap<Discord.GuildMember>(flatMapGuildMembers);

		const roles = message.mentions.roles;

		roles.flatMap<string>((role: Discord.Role, _id: string, _: Discord.Collection<string, Discord.Role>): Discord.Collection<string, string> => {
			role.members.flatMap<Discord.GuildMember>(flatMapGuildMembers);
			return new Discord.Collection<string, string>();
		});

		if (targets.size === 0) {
			return message.reply(`Mention valid users/roles to invite.`);
		}

		const eventId = parseInt(args.shift()!);

		if (isNaN(eventId) || !schedule.hasEvent(eventId)) {
			return message.reply(`Invalid event-id given: ${eventId}`);
		}

		//if (schedule.eventHasUser(eventId, target)) {
		//	return message.reply(`Mentioned user is already in event ${eventId}.`);
		//}

		const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
			return true;
		}
		targets.forEach((member: Discord.GuildMember, id: string) => {
			if (schedule.hasEvent(eventId) && !schedule.eventHasUser(eventId, member.user)) {

				let event = schedule.events.get(eventId)!;

				member.send(`You've been invited to ${event.name} by ${message.author.username}! React to this message to join the event!\nThis event will be on server ${message.guild!.name} on ${event.date.toLocaleDateString()} at ${event.date.toLocaleTimeString()}.`,
						{ allowedMentions: { users: [], roles: [] } })
					.then((resultMessage) => {

						resultMessage.react("😄").then((postReply) => {
							postReply.message.awaitReactions(filter, { max: 1, time: 600000, errors: ["time"] }).then((collected) => {
								if (schedule.hasEvent(eventId)) {	
									schedule.joinEvent(member.user, eventId);
								}
							});
						});

					});
			}
		});
	}
}