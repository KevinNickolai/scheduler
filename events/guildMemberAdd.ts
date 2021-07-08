import * as Discord from "discord.js";
import SchedulerClient from "../classes/SchedulerClient";

module.exports = (client: SchedulerClient, member: Discord.GuildMember) => {
	member.send(`Welcome to ${member.guild.name}! 
	I am ${client.user!.username}, the event scheduling robot.`);
}