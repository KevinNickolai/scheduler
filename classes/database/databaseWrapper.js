const mysql = require('mysql');

/*
* class that wraps a mysql database into utilizing promises
* class inspiration found here:
* https://codeburst.io/node-js-mysql-and-promises-4c3be599909b
*/
class DatabaseWrapper {

	/**
	* DatabaseWrapper constructor
	* @param {Object} config Configuration setup for a mysql connection
	*/
	constructor(config) {
		this.config = config;
		this.connection = mysql.createConnection(config);

		var that = this;

		//Catch any errors that result in database connection loss, and establish a new connection
		this.connection.on('error', function (err) {
			console.log("Database Error", err);
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				that.handleDisconnect();
			} else {
				throw err;
			}
		});
	}

	/**
	* Handles disconnection from the database at any time
	* solution to problem found here:
	* https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
	*/
	handleDisconnect() {
		this.connection = mysql.createConnection(this.config);

		var that = this;

		this.connection.connect(function (err) {
			if (err) {
				console.log("Error when reconnecting to database: ", err);
				setTimeout(that.handleDisconnect, 2000);
			}
		});

		this.connection.on('error', function (err) {
			console.log("Database Error", err);
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				that.handleDisconnect();
			} else {
				throw err;
			}
		});
	}

	/**
	* Query the database
	* @param {string} sql An SQL query to send to the database
	* @param {Array} args An array of arguments to pass with the SQL statement
	*				      defaulted to undefined
	* @return {Promise} a promise object to resolve or reject on database querying completion
	*/
	query(sql, args) {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err, rows) => {
				if (err) return reject(err);

				return resolve(rows);
			});
		});
	}

	/*
	* Close the database connection when done with database querying
	*/
	close() {
		return new Promise((resolve, reject) => {
			this.connection.end(err => {
				if (err) return reject(err);

				resolve();
			});
		});
	}

	/*
	* Initialize the databaseWrapper to allow for error free querying
	*/
	async init() {

		var sql = `CREATE DATABASE IF NOT EXISTS ${this.config.database};`;

		const that = this;

		//the Promise we return will be the success or failure of 
		//creation of the database if it does not already exist;
		//if the database does exist, then the promise resolves as well.
		return this.query(sql)
			.catch((error) => {
				//console.log(`Error creating database ${that.config.database}.`,error);

				//if the error's code was a bad database error, we can still
				//change the connection information and continue with database creation
				if (error.code === 'ER_BAD_DB_ERROR') {

					//temporary variable to hold the current database name
					var dbToBe = that.config.database;

					//create a new connection with an undefined database, preventing
					//another ER_BAD_DB_ERROR
					that.config.database = undefined;
					that.connection = mysql.createConnection(that.config)

					//return a promise of success or failure of the creation of
					//the database from this point on
					return that.query(sql)
						.then(function (result) {

							//on database creation success, restore the database name
							//to the configuration, and add it to the current connection.
							that.config.database = dbToBe;

							that.connection.changeUser({
								database: that.config.database
							}, (err, rows) => {
								if (err) {
									//on error of changing the database for the current connection,
									//the promise should be rejected, as the database is needed
									//for proper querying later on.
									console.log("Error in setting database to connection user", err);
									return Promise.reject(err);
								}

								//the database change succeeded
								return Promise.resolve(rows);
							});
						}).catch(function (err) {

							//querying the connection without a database for database creation failed,
							//so reject the promise.
							console.log("Error querying to no-database connection for database creation.", err);
							return Promise.reject(err);
						});
				} else {

					//the error was something other than ER_BAD_DB_ERROR
					return Promise.reject(error);
				}
			});

		/*
		* The following .then() function can be added between the above query/catch.
		* this function will resolve the issue of a configuration with no database;
		* however, the current sql relies on a database being provided in the config.
		* if that ever changes, this function could be useful, so I'm leaving it in for now.
		*/
		/*
		.then(function(result){
			
			//promise of changing the database's name in the configuration;
			return new Promise((resolve,reject) => {
				that.connection.changeUser({
					database: that.config.database
				}, (err,rows) => {
					if(err){
						console.log("error in setting database to connection user", err);
						return reject(err);
					}

					return resolve(rows);
				});
			});
		})*/
	}
}

module.exports = DatabaseWrapper;