import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";
const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);


module.exports = {
	name: 'types',
	aliases: ['et'],
	description: "Display the types of events.",
	usage: "types",
	args: false,
	execute(message: Discord.Message, args : string[]) {

		const serverId = message.guild!.id;
		const schedule = (message.client as SchedulerClient).scheduler.get(serverId);
		const user = message.author;

		readdirAsync("./classes/events")
			.then((files: string[]) => {

				const creatableEvents = files.filter((file: string) => !file.startsWith("scheduleEvent") && (file.endsWith(".js") || file.endsWith(".ts")));

				message.reply("\n" + creatableEvents.map(file => file.split(".")[0]).join("\n"));
		});
	}
}