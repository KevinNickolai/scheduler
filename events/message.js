module.exports = (client, message) => {

	const { prefix } = require('../config.js');

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	console.log(`message received: ${message.content}`);

	//split up the message into arguments, with whitespace as the delimiter,
	//while also removing the command prefix from the message
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	//retrieve a command that has a name or alias of commandName
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	const user = message.author;

	if (!command) {
		//console.log("No command '" + commandName + "' exists.");
		return user.send("No command '" + commandName + "' exists.");
	}

	//Checking for arguments if a command requires arguments to be present
	if (command.args && !args.length) {
		//TODO: Add potential check here for existence of a usage help prompt, if the command
		//in question has a usage property.
		return user.send("You must provide arguments for the " + commandName + " command.");
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error("Error processing command " + commandName + ":", error);
		return user.send("Error processing command '" + commandName + "'.");
	}
}