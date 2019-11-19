const client = require('./client.js');
const config = require('./config.js');

const databaseManager = require('./classes/database/databaseManager.js');
const db = new databaseManager();
main();

/*
 * Initialize the main functionality of the scheduler bot
 */
async function main() {
	/*
	 * Login to the discord bot, verify success;
	 * Verify the database has connection
	 */
	Promise.all(
		[client.login(config.botToken),
		db.Init(config.localDBConfig)]
	).then(result => {

		//Set the client's database for access when commands are taken in by client
		client.database = db;

		/*
		* After proper connections, fill any schedules 
		* not already existant in the discord client
		*/
		client.scheduler.forEach((schedule, guildId) => {
			database.setSchedule(schedule, guildId);
		});

		//forEach schedule, populate with events in the database
		console.log('Initialized database and logged in!');

	}).catch(err => {
		console.log(err);
		process.exit(1);
	});
}