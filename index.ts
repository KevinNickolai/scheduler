import SchedulerClient from "./classes/SchedulerClient";
import * as clientImport from "./client";
import * as config from "./config";
import * as client from "./client.js";

main();

/*
 * Initialize the main functionality of the scheduler bot
 */
async function main() {

	/*
	 * Login to the discord bot, verify success;
	 * Verify the database has connection
	 */
	Promise.all([
		client.default.database.Init(config.default.DBConfig),
		client.default.login(config.botToken)
	])
	.then(() => {

		console.log(client.default.scheduler);

		/*
		* After proper connections, fill any schedules 
		* not already existant in the discord client
		*/
		//client.default.scheduler.forEach((schedule, guildId) => {
		//	client.default.database.setSchedule(schedule, guildId, client.default);
		//});

		//forEach schedule, populate with events in the database
		console.log('Initialized database and logged in!');

	}).catch((err : Error) => {
		console.log(err);
		process.exit(1);
	});
}