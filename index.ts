import SchedulerClient from "./classes/SchedulerClient";
import * as clientImport from "./client";
import * as config from "./config";
let client = clientImport.default;
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
		client.database.Init(config.default.DBConfig),
		client.login(config.botToken)
	])
	.then(() => {

		/*
		* After proper connections, fill any schedules 
		* not already existant in the discord client
		*/
		client.scheduler.forEach((schedule, guildId) => {
			client.database.setSchedule(schedule, guildId, client);
		});

		//forEach schedule, populate with events in the database
		console.log('Initialized database and logged in!');

	}).catch((err : Error) => {
		console.log(err);
		process.exit(1);
	});
}