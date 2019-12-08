const databaseWrapper = require('./databaseWrapper.js');
const autofireEvent = require('../autofireEvent.js');

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
			event_id SMALLINT NOT NULL,
			event_name VARCHAR(128) NOT NULL,
			event_date DATETIME NOT NULL,
			PRIMARY KEY (id),
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
			PRIMARY KEY (id)
			);`);

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

		//the ID of the schedule we want to work with
		var scheduleId;

		/*
		 * if no results, create an entry in the database for the guild;
		 * then enter events in the schedule
		 */
		if (result.length === 0) {

			//Get inserted row ID to get the id primary key from the schedules table
			const rowId = await this.database.query(
				`INSERT INTO ${this.schedulesTable.name} (guild_id)
				VALUES (${guildId});`).then((result) => {
					return result.insertId;
				});

			//Get the id primary key from the schedules table
			scheduleId = await this.database.query(
				`SELECT id FROM ${this.schedulesTable.name}
				WHERE id = ${rowId};`).then((result) => {
					return result[0].id;
				});
		} else {
			scheduleId = result[0].id;
		}

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
				 * recreate the event from the database;
				 * the date has an ISO representation of milliseconds + timezone character at the end, so that
				 * the date may be interpreted without offset here, as it was interpreted that way when being placed into the database
				 */
				const event = new autofireEvent(eventData.event_name, new Date(eventData.event_date + `.000z`));
				schedule.readdEvent(event, eventData.event_id);

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
					console.error(error);
					process.exit(0);
				});


			});


		})

	}).catch((error) => {
		console.error(error);
		process.exit(0);
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
 * Add an event to the database
 * @param {ScheduleEvent} event The event to add to the database
 * @param {number} eventId The ID of the event
 * @param {string} guildId the ID of the guild
 */
DatabaseManager.prototype.addEvent = async function (event, eventId, guildId) {

	//extract the date from the event, and parse to get a workable date string
	const date = event.date.toISOString().split('.')[0];

	const sql = `SELECT id FROM ${this.schedulesTable.name}
		WHERE guild_id = ${guildId};`;

	this.database.query(sql
		)
		.then((result) => {
			scheduleId = result[0].id;
			this.database.query(
				`INSERT INTO ${this.eventTable.name} (schedule_id, event_id, event_name, event_date)
				VALUES (${scheduleId}, ${eventId}, '${event.name}', STR_TO_DATE('${date}','%Y-%m-%dT%H:%i:%s'));`
			);
		}).catch((error) => {
			console.error(error);
		});
}

/**
 * Remove an event from the database
 * @param {number} eventId the ID of the event to remove
 * @param {string} guildId the ID of the guild to remove from
 */
DatabaseManager.prototype.removeEvent = async function (eventId, guildId) {
	this.database.query(
		`DELETE FROM ${this.eventTable.name}
		WHERE event_id = ${eventId} AND
		schedule_id = (SELECT id FROM ${this.schedulesTable.name}
		WHERE guild_id=${guildId});`
	).catch((error) => {
		console.error(error);
	});
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