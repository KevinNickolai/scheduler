
module.exports = {
	name: 'invite',
	aliases: ['inv', 'i'],
	description: "Invite a user to the event..",
	usage: "@discord_user event-id",
	args: true,
	serverUnique: true,
	execute(message, args) {

		if (args.length < 2) {

			const argError = `Invite requires at least two arguments of a discord user mention and an event-id.`;

			message.client.messageError = argError;
			return message.author.send(argError);
		}

		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		/*
		 * Process the date & time given by the user
		 */
		const mention = args.shift();
		const target = message.mentions.members.first();

		if (!target) {
			return message.reply(`Mention a user to invite.`);
		}

		const eventId = parseInt(args.shift());

		if (isNaN(eventId) || !schedule.hasEvent(eventId)) {
			return message.reply(`Invalid event-id given: ${eventId}`);
		}

		if (schedule.eventHasUser(eventId, target)) {
			return message.reply(`Mentioned user is already in event ${eventId}.`);
		}

		const filter = (reaction, user) => {
			return true;
		}

		target.send(`You've been invited to event ${eventId}! react to join the event on server ${message.guild.name}!`)
			.then((resultMessage) => {
				resultMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
					.then(collected => {
						const reaction = collected.first();

						if (schedule.hasEvent(eventId)) {
							schedule.joinEvent(target, eventId);
						}

					})
					.catch(collected => {
						console.log(`user opted to not join eventId ${eventId}`); //message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
					});
			});


	}
}