import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";
import { Schedule } from "../classes/schedule";
import { parseDate } from "../classes/parseDate";
import { EventType, getEventType } from "../classes/EventType";
import dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";

import { AutofireEvent } from "../classes/events/autofireEvent";
import { DurationEvent } from "../classes/events/durationEvent";
import { ScheduleEvent } from "../classes/events/scheduleEvent";

enum EditType {
	date,
	time,
	datetime,
	type,
	none
}

const reactions = ["📅", "🕰️", "🗒"];

module.exports = {
	name: 'edit',
	aliases: ['change', 'modify'],
	description: "Edit an event.",
	usage: "<command name>",
	args: true,
	serverUnique: true,
	execute(message: Discord.Message, args: string[]) {
		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId)!;

		//TODO: determine how to edit messages based on event id & which user is requesting to change things

		let eventId = parseInt(args.shift()!);

		if (isNaN(eventId) || !schedule.hasEvent(eventId) || schedule.events.get(eventId)!.owner.id !== message.author.id) {
			return message.reply(`Invalid eventId: ${eventId}`);
		}

		const event = schedule.events.get(eventId)!;

		let type = args.shift();
		let editType = EditType.none;
		switch (type) {
			case "date":
				editType = EditType.date;
				break;
			case "time":
				editType = EditType.time
				break;
			case "type":
				editType = EditType.type;
				break;
			case "datetime":
				editType = EditType.datetime
				break;
			default:
				break;
		}

		let awaitingType = Promise.resolve(editType);

		if (editType === EditType.none) {

			const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
				// filter by date or time reactions and whether or not the user reacting is a bot.
				return user.id === message.author.id &&
					event.owner.id === user.id &&
					reactions.includes(reaction.emoji.name);
			}

			awaitingType = new Promise((resolve, reject) => {
				message.reply("Date, Time, or Type edit?")
					.then((checkMessage) => {
						return Promise.all(
							[
								checkMessage.react(reactions[0]),
								checkMessage.react(reactions[1]),
								checkMessage.react(reactions[2])
							]);
					})
					.then((dttReactions) => {
						let checkMessage = dttReactions[0].message;

						let rCollector = checkMessage.createReactionCollector(filter, { idle: 60000, time: 120000, maxEmojis: 1 });


						rCollector.on("collect", (reaction, user) => {
							switch (reaction.emoji.name) {
								case reactions[0]:
									editType = editType === EditType.time ? EditType.datetime : EditType.date;
									rCollector.options.maxEmojis = 2;
									rCollector.options.idle = 5000;
									break;
								case reactions[1]:
									editType = editType === EditType.date ? EditType.datetime : EditType.time;
									rCollector.options.maxEmojis = 2;
									rCollector.options.idle = 5000;
									break;
								case reactions[2]:
									editType = EditType.type;
									break;
							}
						});

						rCollector.on("end", (collection, reason) => {
							let choice = Array.from(collection.values());

							let reactionNames = choice.map((r: Discord.MessageReaction) => r.emoji.name);

							let choiceString = reactionNames.join(", ");

							checkMessage.edit(`You chose ${choiceString}. Type your edit in a new message with the correct parameters.`);

							return resolve(editType);
						});

					});
			});
		}

		awaitingType.then((confirmedEditType) => {

			const messageFilter = (msg: Discord.Message, usr: Discord.User) => {
				console.log(msg.content);
				return usr.id === event.owner.id;
			}

			let msgCollector = message.channel.createMessageCollector(messageFilter, { idle: 60000, time: 120000 });

			msgCollector.on("collect", (m: Discord.Message) => {
				let collectedArgs = m.content.split(/ +/);

				console.log(m.content);

				let newDate = event.date;
				dayjs.extend(customParseFormat.default);

				let dateOrderWithYear = ["MM", "DD", "YY"];
				let dateOrder = ["MM", "DD"];
				let supportedFormatsDate = [dateOrderWithYear.join("-"), dateOrderWithYear.join("/"),
				dateOrderWithYear.join("."), dateOrderWithYear.join(" "),
				dateOrder.join("-"), dateOrder.join("/"),
				dateOrder.join("."), dateOrder.join(" ")
				];

				let timeOrder24hr = ["HH", "mm"];
				let timeOrder12hr = ["hh", "mm"];
				let supportedFormatsTime = ["hh:mmA", "hh:mma", "HH:mm"]

				let supportedDateTime: string[] = [];

				supportedFormatsDate.forEach((formatDate, idx, sfd) => {

					supportedFormatsTime.forEach((formatTime, tidx, sft) => {
						supportedDateTime.push(formatDate + " " + formatTime);
					});

				});


				switch (confirmedEditType) {
					case EditType.date:

						let newEditDate = dayjs(m.content, supportedFormatsDate);
						console.log(newEditDate.toISOString());
						if (!newEditDate.isValid() || newEditDate.isBefore(dayjs())) {
							return m.reply("Invalid date string given.");
						}

						event.modifyDate(newEditDate.toDate());
						break;
					case EditType.time:

						let newEditTime = dayjs(m.content, supportedFormatsTime);

						if (!newEditTime.isValid() || newEditTime.isBefore(dayjs())) {
							return m.reply("Invalid time string given.");
						}

						event.modifyDate(newEditTime.toDate());
						break;
					case EditType.datetime:

						let newEditDateTime = dayjs(message.content, supportedDateTime);

						if (!newEditDateTime.isValid() || newEditDateTime.isBefore(dayjs())) {
							return m.reply("Invalid datetime string given.");
						}

						event.modifyDate(newEditDateTime.toDate());

						break;
					case EditType.type:
						let eventType = getEventType(collectedArgs.shift()!);
						switch (eventType) {
							default:
							case EventType.schedule:
								break;
							case EventType.autofire:
								if(typeof(event) !== typeof(AutofireEvent)) m.reply("Changed event to autofire.");
								break;
							case EventType.duration:
								/// extra processing for duration-time here
								if(typeof(event) !== typeof(DurationEvent)) m.reply("Changed event to duration.");
								break;
						}
						break;

					default:
						m.reply(`Error processing your message response to edit event ${eventId}.`);
						break;
				}

			});

		});
		
	}
}