const schedulerChannelName = 'events';

/**
 * Create the schedule and associate it with the client for later referencing
 * */
import { Schedule } from "../classes/schedule";

import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";

/**
 * 
 * @param {} client
 */
module.exports = (client: SchedulerClient) => {

	var schedulerMap = new Map();

	/**
	 * For every server that the bot is a part of, we would like to
     * create a scheduling channel if not already existing, and then
	 * create a mapping for each server to their own unique schedule.
	 * */
	client.channels.fetch('714249299382370389', true)
		.then((result) => {
			if (result.isText()) {

				let cnl: Discord.TextChannel = result as Discord.TextChannel;
				var schedulerChannel = result;

				
				//schedulerChannel.guildId = guild.id;

				client.scheduler.set(cnl.guild.id, new Schedule(cnl.id, client, cnl.guild.id));

			}
		});

	//client.guilds.cache.flatMap<Discord.Guild>(async (guild) : Promise<Discord.Guild> => {


	//	if (!schedulerChannel) {
	//		schedulerChannel = await guild.channels.create(schedulerChannelName, { type: 'text' })
	//			.then(function (result) {
	//				console.log("Created scheduler channel on server id: " + guild.id);
	//				return result;
	//			}).catch(function (error) {
	//				console.log("Failed to create scheduler channel on server id: " + guild.id);
	//				throw error;
	//			});
	//	}


	//	return guild;
	//});

	if (client.user) {
		console.log(`Logged in as ${client.user.tag}!`);
	}

	console.log(`Schedulers initialized for ${client.guilds.cache.size} servers.`);
}