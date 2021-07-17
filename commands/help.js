module.exports = {
	name: 'help',
	aliases: ['commands', 'cmds', '?'],
	description: "Gives information on specific commands or lists all possible commands.",
	usage: "<command name>",
	execute(message,args){
		//empty array to store data we will display to the user
		const data = [];

		//client's commands to display for the help command
		const commands = message.client.commands;

		const { prefix } = require('../config.js');

		//if there are no arguments, we are doing a general help command
		//i.e. no specific command info, just a list of commands.
		if(!args.length){

			data.push("List of commands:");

			let cmds = [];

			for (var [key, val] of commands) {
				cmds.push(val.name);
			}
			data.push(cmds.join(", "));

			//data.push(commands.values().map(command => command.name).join(', '));
			data.push(`\nUse \'${prefix}help <command name>\' for help on specific commands.`);

			return message.author.send(data, { split: true})
				.then(() => {
					//TODO: possibly reply to the user in channel with following code
					//if (message.channel.type === 'dm') return;
					//message.reply('I\'ve sent you a DM with all my commands!');
				}).catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('Command DM failed. Do you have DMs disabled?');
				})
		} else{ //< specific command help info
			const name = args[0].toLowerCase();
			const command = commands.get(name) 
					|| commands.find(c => c.aliases && c.aliases.includes(name));

			if(!command){
				return message.author.send(`'${name} is not a valid command.`);
			}

			data.push(`**Name:** ${command.name}`);

			if(command.aliases) data.push(`*Aliases:* ${command.aliases.join(', ')}`);
			if(command.description) data.push(`*Description:* ${command.description}`);
			if(command.usage) data.push(`*Usage:* ${prefix}${command.name} ${command.usage}`);

			//send the user the help data; split will split the
			//message if it surpasses discord's character limit
			message.author.send(data, { split: true });
		}
	}
}