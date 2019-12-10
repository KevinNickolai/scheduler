const client = require('./client.js');
const config = require('./config.js');

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
		client.database.Init(config.dbConfig),		
		client.login(config.botToken)
	])
	.then(result => {

		/*
		* After proper connections, fill any schedules 
		* not already existant in the discord client
		*/
		client.scheduler.forEach((schedule, guildId) => {
			client.database.setSchedule(schedule, guildId, client);
		});

		//forEach schedule, populate with events in the database
		console.log('Initialized database and logged in!');

	}).catch(err => {
		console.log(err);
		process.exit(1);
	});
}