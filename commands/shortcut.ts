import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";

module.exports = {
	name: 'shortcut',
	aliases: ['sc'],
	description: "create a shortcut.",
	permissions: ["MANAGE_ROLES"],
	usage: "shortcut shortcut-name",
	args: true,
	execute(message: Discord.Message, args: string[]) {

		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId);
		const user = message.author;
		const shortcuts = (message.client as SchedulerClient).shortcuts;
		const scName = args.shift()!;


		if (shortcuts.has(scName)) {
			return message.reply(`Shortcut ${scName} already exists for a role.`);
		}

		message.reply(`To create a shortcut with name ${scName}, edit your command message with the @role to notify.`)
			.then((reply) => {

				/*
				 * wait 60 seconds, then process the first edit that comes through.
				 */
				let counter = 1
				let maxCounter = 60
				let interval = setInterval(() => {

					if (counter >= maxCounter) {
						clearInterval(interval);
						message.reply("Shortcut not created.");
						return;
					}

					if (message.edits.length > 0) {

						message.edits[0].mentions.roles.flatMap((role: Discord.Role, roleId: string, mentions: Discord.Collection<string, Discord.Role>) => {
							if (mentions.size > 1) {
								return mentions;
							}

							message.reply(`Created shortcut with name ${scName} for role ${role.name}.`);
							clearInterval(interval);

							(message.client as SchedulerClient).shortcuts.set(scName, roleId);

							return mentions;
						});

					}

					++counter;
				}, 1000);
			});
	}
}