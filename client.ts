import * as Discord from "discord.js";
import SchedulerClient from "./classes/SchedulerClient";
const client = new SchedulerClient();
//const config = require('./config.js');
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
readdirAsync('./commands')
	.then((files : string[]) => {
		const commandFiles = files.filter(file => file.endsWith('.js'));

		commandFiles.forEach(file => {
			const command = require(`./commands/${file}`);

			client.commands.set(command.name, command);
		});
	})
	.catch((error : Error) => {
		console.log(error);
	});

/*
 * Read in events from the events directory
 */
readdirAsync('./events')
	.then((files : string[]) => {
		//console.log(files);
		const eventFiles = files.filter(file => file.endsWith('.js'));

		eventFiles.forEach(file => {
			const eventHandler = require(`./events/${file}`);
			const eventName = file.split(".")[0];
			
			if (eventName === "ready") {
				client.once(eventName, (...args : any[]) => eventHandler(client, ...args));
			} else {
				client.on(eventName, (...args : any[]) => eventHandler(client, ...args));
			}
		});
	})
	.catch((error : Error) => {
		console.log(error);
	});

export default client;
