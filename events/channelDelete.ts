import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";

module.exports = async (client: SchedulerClient, channel: Discord.Channel) => {

	//if the channel has a set guild ID and matches that of a channel within a scheduler, we need to 
	//recreate the channel for the scheduler.
	
	if (channel.isText() && channel.type === "text") {

		let cnl: Discord.TextChannel = channel as Discord.TextChannel;
		if (cnl.id === client.scheduler.get(cnl.guild.id)!.channelId) {
			const guild = client.guilds.fetch(channel.guild.id);

			guild.then((guildFound) => {
				var schedulerChannel =
					guildFound.channels.create('events', { type: 'text' })
					.then((result: Discord.Channel & Discord.TextChannel) => {
						console.log("Created scheduler channel on server id: " + guildFound.id);
						client.scheduler.get(guildFound.id)!.channelId = result.id;
						return result;
					}).catch(function (error) {
						console.log("Failed to create scheduler channel on server id: " + guildFound.id);
						throw error;
					});

				
			}).catch((err) => {
				console.log(err);
			})
			
		}

	}

}