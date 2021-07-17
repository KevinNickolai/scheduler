import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";
import { Schedule } from "../classes/schedule";

const reactions: Discord.EmojiResolvable[] = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];

module.exports = {
	name: 'display',
	aliases: ['schedule', 'show', 'events'],
	description: "Display the schedule.",
	usage: "<command name>",
	serverUnique: true,
	execute(message: Discord.Message, args: string[]) {

		let pageNumber = 1;
		if (args.length >= 1) {
			let argumentPageNumber = args.shift()!;
			if (!isNaN(parseInt(argumentPageNumber))) {
				pageNumber = parseInt(argumentPageNumber);
			}
		}

		/*
		 * Retrieve and display the schedule
		 */
		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId)!;

		

		// events on display for the selected page
		let displayEvents = schedule.displayEvents(pageNumber);
		// amount of reactions to show, 0-9 based on the amount of events in the schedule
		let reactionsToShow = displayEvents.size >= 10 ? 10 : displayEvents.size;

		message.reply("```Page " + pageNumber + "```" + schedule.displayFromMap(displayEvents))
			.then((reply) => {
				let allReactions = reactions.filter((val, idx) => idx < reactionsToShow );

				const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
					// filter by the 0-9 reactions and whether or not the user reacting is a bot.
					return !user.bot &&
						reactions.includes(reaction.emoji.name);
				}

				let reactionCollector = reply.createReactionCollector(filter, { dispose: true, time: 300000 });

				let fnOnEventsChangedHandler = (sender: Schedule, _: any) => {
					displayEvents = schedule.displayEvents(pageNumber);
					reply.edit("```Page " + pageNumber + "```" + schedule.displayFromMap(displayEvents));

					const removalRequired = reactionsToShow > displayEvents.size && displayEvents.size >= 0;
					const additionRequired = reactionsToShow < displayEvents.size && displayEvents.size < schedule.DISPLAY_PAGE_SIZE;

					reactionsToShow = displayEvents.size;
					allReactions = reactions.filter((val, idx) => idx < reactionsToShow);

					// react to remove the last emoji if neccessary
					if (removalRequired) {
						reply.react(reactions[displayEvents.size]).then((reaction) => {
							reaction.remove();
						});
					} else if (additionRequired) {
						reply.react(reactions[reactionsToShow - 1]);
					}
				};

				schedule.onEventsChanged.sub(fnOnEventsChangedHandler);

				/*
				 * Collect reactions, adding a user based on the index of the reaction they selected to the corresponding event
				 */
				reactionCollector
					.on("collect", (reaction: Discord.MessageReaction, user: Discord.User) => {

						let reactIndex = reactions.indexOf(reaction.emoji.name)!;

						let entries = Array.from(displayEvents.entries());

						console.log(entries);

						if (!entries[reactIndex][1].users.has(user.id)) {
							schedule.joinEvent(user, entries[reactIndex][0]).then(() => {
								displayEvents = schedule.displayEvents(pageNumber);
								reply.edit("```Page " + pageNumber + "```" + schedule.displayFromMap(displayEvents));
							});
							
						}
					});

				/*
				 * Remove reactions, removing a user based on the index of the reaction they removed on the corresponding event
				 */
				reactionCollector
					.on("remove", (reaction: Discord.MessageReaction, user: Discord.User) => {

						let reactIndex = reactions.indexOf(reaction.emoji.name)!;

						let entries = Array.from(displayEvents.entries());

						if (entries[reactIndex][1].users.has(user.id)) {
							schedule.leaveEvent(user, entries[reactIndex][0]).then(() => {
								displayEvents = schedule.displayEvents(pageNumber);
								reply.edit("```Page " + pageNumber + "```" + schedule.displayFromMap(displayEvents));
							});
							
							
						}
					});

				reactionCollector
					.on("end", (collected: Discord.Collection<string, Discord.MessageReaction>, reason: string) => {
						schedule.onEventsChanged.unsub(fnOnEventsChangedHandler);
						reply.reactions.removeAll();
						reply.delete();
					});
				/*
				 * React in sequence based on how many reactions need to be displayed for this page
				 */
				allReactions.reduce<Promise<Discord.MessageReaction>>((p: Promise<Discord.MessageReaction>, _, i) => {
					
					return p.then(() => reply.react(allReactions[i]));

				}, reply.react(allReactions[0]));

				
				//reply.awaitReactions(filter, { max:50, time: 60000, errors: ['time'] })
				//	.then(() => {
				//		console.log(displayEvents);
				//	});
			});
	}
}