import SchedulerClient from "../classes/SchedulerClient";
import * as Discord from "discord.js";

module.exports = (client : SchedulerClient, message: Discord.Message) => {

	const { prefix } = require('../config.js');

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	//making sure the message is in the correct channel
	if (message.guild &&
		client.scheduler.get(message.guild.id!)!.channelId !== message.channel.id) {
		return;
	}


	//console.log(`message received: ${message.content}`);

	//split up the message into arguments, with whitespace as the delimiter,
	//while also removing the command prefix from the message
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift()!.toLowerCase();

	//retrieve a command that has a name or alias of commandName
	const command = client.commands.get(commandName)
		|| Array.from<any>(client.commands.values()).find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName));

	const user = message.author;

	if (!command) {
		//console.log("No command '" + commandName + "' exists.");

		const commandError = "No command '" + commandName + "' exists.";

		client.messageError = commandError;

		return user.send(commandError);
	}

	//Checking for arguments if a command requires arguments to be present
	if (command.args && !args.length) {
		//TODO: Add potential check here for existence of a usage help prompt, if the command
		//in question has a usage property.

		const argError = "You must provide arguments for the " + commandName + " command."

		client.messageError = argError;

		return user.send(argError);
	}

	//checking for a server unique command, which requires the command be sent in the server to schedule.
	if (!message.guild && command.serverUnique)
		return message.author.send(
			"This bot supports multiple servers; use the scheduler in the server you would like to schedule events for."
		);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error("Error processing command " + commandName + ":", error);
		return user.send("Error processing command '" + commandName + "'.");
	}
}