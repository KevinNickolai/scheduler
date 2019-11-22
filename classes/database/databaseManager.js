const databaseWrapper = require('./databaseWrapper.js');

/**
 * Class that describes a database table and its columns
 * */
class Table {
	constructor(name, columns) {
		this.name = name;
		this.columns = columns

		this.sqlCreate = `CREATE TABLE IF NOT EXISTS ${name} ` + columns;
	}
}

/*
 * Class that manages database actions for the Scheduler
 */
class DatabaseManager {

	/**
	 * Initialize the instance of the manager by populating the database
	 * */
	constructor() {

		this.schedulesTable = new Table("schedules",
			`(id INT NOT NULL AUTO_INCREMENT,
			guild_id VARCHAR(24) NOT NULL,
			PRIMARY KEY (id)
			)`);

		this.eventTable = new Table("events",
			`(id INT NOT NULL AUTO_INCREMENT,
			schedule_id INT NOT NULL,
			event_id VARCHAR(4) NOT NULL,
			event_date DATETIME NOT NULL,
			PRIMARY KEY (id)
			FOREIGN KEY (schedule_id)
			REFERENCES ${this.schedulesTable.name}(id)
			ON UPDATE CASCADE
			ON DELETE CASCADE
			)`);

		this.usersTable = new Table("users",
			`(id INT NOT NULL AUTO_INCREMENT,
			user_id INT NOT NULL,
			username VARCHAR(32) NOT NULL,
			discriminator VARCHAR(4) NOT NULL,
			PRIMARY KEY (id);
			)`);

		this.eventMembersTable = new Table("members",
		`(event_id INT NOT NULL,
		user_id INT NOT NULL,
		PRIMARY KEY (event_id, user_id),
		FOREIGN KEY (event_id)
		REFERENCES ${this.eventTable.name}(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
		FOREIGN KEY (user_id)
		REFERENCES ${this.usersTable.name}(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
		)`
		);
	 
	}

}

/**
 * Set a schedule based on its guildId
 * @param {Schedule} schedule The schedule to set, based on the database information
 * @param {string} guildId The ID of the guild we are setting the schedule for
 */
DatabaseManager.prototype.setSchedule = async function (schedule, guildId) {

	//Get the database Schedule id we want to work with
	this.database.query(
		`SELECT id FROM ${this.schedulesTable.name}
		WHERE guild_id = ${guildId};`
	).then(async (result) => {

		/*
		 * if no results, create an entry in the database for the guild;
		 * then enter events in the schedule
		 */
		console.log(result);
		if (result.length === 0) {
			result = await this.database.query(
				`INSERT INTO ${this.schedulesTable.name} (guild_id)
				VALUES ${guildId};`);
		}

		//the ID of the schedule we want to work with
		const scheduleId = result[0];

		/*
		 * Query for events in this schedule
		 */
		this.database.query(
			`SELECT * FROM ${this.eventTable.name} 
			WHERE schedule_id = ${scheduleId};`
		).then((result) => {
			/*
			 * Process events' data, put into schedule
			 */
			result.forEach((eventData) => {

				/*
				 * TODO: determine how to serialize event type in database for reproduction here
				 * Enum?
				 */

				/*
				 * Add users to the events
				 */
				this.database.query(
					`SELECT user_id FROM ${this.eventMembersTable.name}
					WHERE event_id = ${eventData.id}`
				).then((result) => {

					/*
					 * Get user info to create the Discord.User object
					 */
					result.forEach((memberId) => {

						this.database.query(
							`SELECT * FROM ${this.usersTable}
							WHERE id = ${memberId};`
						).then((result) => {
							result.forEach((userData) => {
								const user = new Discord.User(client, {
									id: `${userData.user_id}`,
									username: `${userData.username}`,
									discriminator: `${userData.discriminator}`,
									bot: false
								});

								/*
								 * Add the user to the event they were previously in
								 */
							});
						});

					});
				}).catch((error) => {

				});


			});


		})

	}).catch((error) => {

	});


}

/**
 * Create a table for the Database
 * @param {Table} table the Table Create
 * @returns {Promise} A promise to resolve when the table has been created
 */
DatabaseManager.prototype.createTable = async function (table) {
	return this.database.query(table.sqlCreate);
}

/**
 * Initialize the database manager
 * @param {Object} dbConfig The configuration for mysql and the database
 * @returns {Promise} A promise to resolve when the database skeleton has been created
 */
DatabaseManager.prototype.Init = async function (dbConfig) {

	//create a new database wrapper to support database querying with promises
	const database = new databaseWrapper(dbConfig);
	this.database = database;

	const that = this;

	return new Promise((resolve, reject) => {

		/*
		 * Chain table creation in the database for initialization
		 */
		that.database.init()
			.then((result) => {
				console.log("Created & Connected to Database!");

				/*
				 * Set interval database querying to prevent loss of the connection
				 */
				setInterval(function () {
					that.database.query('SELECT 1');
				}, 45000);

				return that.createTable(that.schedulesTable);
			})
			.then((result) => {
				console.log(`Created Table ${that.schedulesTable.name}!`);

				return that.createTable(that.eventTable);
			})
			.then((result) => {
				console.log(`Created Table ${that.eventTable.name}!`);

				return that.createTable(that.usersTable);
			})
			.then((result) => {
				console.log(`Created Table ${that.usersTable.name}!`);

				return that.createTable(that.eventMembersTable);
			})
			.then((result) => {
				console.log(`Created Table ${that.eventMembersTable.name}`);

				return resolve('Created all tables!');
			})
			.catch((err) => {
				database.close();
				console.log("Closed database out of initialization error");

				return reject(err);
			});
	});
}

module.exports = DatabaseManager;