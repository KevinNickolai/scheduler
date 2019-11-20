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
			guild_id VARCHAR(24) NOT NULL,
			event_id VARCHAR(4) NOT NULL,
			event_date DATETIME NOT NULL,
			PRIMARY KEY (id)
			)`);

		this.usersTable = new Table("users",
			`(id INT NOT NULL AUTO_INCREMENT,
			
			
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
	this.database.query(
		`SELECT * FROM ${this.schedulesTable.name}
		WHERE guild_id = ${guildId};`
	).then((result) => {
		/*
		 * if no results, create an entry in the database for the guild;
		 * else, enter events in the schedule
		 */
		console.log(result);
		if (result.length === 0) {
			this.database.query(
				`INSERT INTO ${this.schedulesTable.name} (guild_id)
				VALUES ${guildId};`);
		}



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

		that.database.init()
			.then((result) => {
				console.log("Created & Connected to Database!");

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

				return resolve();
			})
			.catch((err) => {
				database.close();
				console.log("Closed database out of initialization error");

				return reject(err);
			});
	});
}

module.exports = DatabaseManager;