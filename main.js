const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.js');
const fs = require('fs');



/**
 * Promisify directory reading, then create event handling 
 * for all defined events
 */
const { promisify } = require('util');

const readdirAsync = promisify(fs.readdir);

readdirAsync('./events')
	.then((files) => {
		console.log(files);
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

client.login(config.botToken);