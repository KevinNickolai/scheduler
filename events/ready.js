const schedulerChannelName = 'events';

/**
 * Create the schedule and associate it with the client for later referencing
 * */
const Schedule = require('../classes/schedule.js');

/**
 * 
 * @param {} client
 */
module.exports = (client) => {

	var schedulerMap = new Map();

	/**
	 * For every server that the bot is a part of, we would like to
     * create a scheduling channel if not already existing, and then
	 * create a mapping for each server to their own unique schedule.
	 * */
	client.guilds.cache.forEach(async (guild) => {

		var schedulerChannel = guild.channels.cache.find(channel => channel.name === schedulerChannelName);

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

		schedulerChannel.guildId = guild.id;

		schedulerMap.set(guild.id,new Schedule(schedulerChannel.id, client, guild.id));

	});

	client.scheduler = schedulerMap;

	if (client.user) {
		console.log(`Logged in as ${client.user.tag}!`);
	}

	console.log(`Schedulers initialized for ${client.guilds.cache.size} servers.`);
}