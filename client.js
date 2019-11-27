const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.js');
const fs = require('fs');

/**
 * Promisify directory reading, then create event handling 
 * for all defined events, as well as creating the command list.
 */
const { promisify } = require('util');

const readdirAsync = promisify(fs.readdir);

/*
 * Read in commands from the commands directory
 */
client.commands = new Discord.Collection;
readdirAsync('./commands')
	.then((files) => {
		const commandFiles = files.filter(file => file.endsWith('.js'));

		commandFiles.forEach(file => {
			const command = require(`./commands/${file}`);

			client.commands.set(command.name, command);
		});
	})
	.catch((error) => {
		console.log(error);
	});

/*
 * Read in events from the events directory
 */
readdirAsync('./events')
	.then((files) => {
		//console.log(files);
		files.forEach(file => {
			const eventHandler = require(`./events/${file}`);
			const eventName = file.split('.')[0];

			if (eventName === 'ready') {
				client.once(eventName, (...args) => eventHandler(client, ...args));
			} else {
				client.on(eventName, (...args) => eventHandler(client, ...args));
			}
		});
	})
	.catch((error) => {
		console.log(error);
	});

module.exports = client;