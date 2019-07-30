const schedulerChannelName = 'scheduler';

/**
 * Create the schedule and associate it with the client for later referencing
 * */
const Schedule = require('../classes/schedule.js');

module.exports = (client) => {

	var schedulerMap = new Map();

	console.log(`Logged in as ${client.user.tag}!`);

	client.guilds.forEach(async (guild) => {

		var schedulerChannel = guild.channels.find(channel => channel.name === schedulerChannelName);

		if (!schedulerChannel) {
			schedulerChannel = await guild.createChannel(schedulerChannelName, { type: 'text' })
				.then(function (result) {
					console.log("Created scheduler channel on server id: " + guild.id);
					return result;
				}).catch(function (error) {
					console.log("Failed to create scheduler channel on server id: " + guild.id);
					throw error;
				});
		}

		schedulerMap.set(guild.id,new Schedule(schedulerChannel.id));

	});

	client.scheduler = schedulerMap;
}