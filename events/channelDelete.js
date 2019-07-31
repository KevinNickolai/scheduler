module.exports = async (client, channel) => {

	//if the channel has a set guild ID and matches that of a channel within a scheduler, we need to 
	//recreate the channel for the scheduler.
	if (channel.guildId && channel.id === client.scheduler.get(channel.guildId).channelId) {

		const guild = client.guilds.get(channel.guildId);

		var schedulerChannel = await guild.createChannel('events', { type: 'text' })
				.then(function (result) {
					console.log("Created scheduler channel on server id: " + guild.id);
					return result;
				}).catch(function (error) {
					console.log("Failed to create scheduler channel on server id: " + guild.id);
					throw error;
				});

		schedulerChannel.guildId = guild.id;

		client.scheduler.get(channel.guildId).channelId = schedulerChannel.id;
	}

}