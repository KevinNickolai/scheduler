import * as Discord from "discord.js";
import { DatabaseWrapper } from "./databaseWrapper";
import * as mysql from "mysql";
import SchedulerClient from "../SchedulerClient";
import { Schedule } from "../schedule";
import { ScheduleEvent } from "../events/scheduleEvent";
import { IDBConfigLayout } from "../../config";
import { AutofireEvent } from "../events/autofireEvent";

export namespace DatabaseManager {

	/**
	 * Class that describes a database table and its columns
	 * */
	export class Table {
		public readonly name: string;
		protected readonly columns: string;

		public readonly sqlCreate: string;

		constructor(name: string, columns: string) {
			this.name = name;
			this.columns = columns

			this.sqlCreate = `CREATE TABLE IF NOT EXISTS ${name} ` + columns;
		}
	}

	/*
	 * Class that manages database actions for the Scheduler
	 */
	export class DatabaseManager {

		public readonly schedules: Table;
		public readonly events: Table;
		public readonly users: Table;
		public readonly eventMembers: Table
		protected database: DatabaseWrapper | undefined;

		/**
		 * Initialize the instance of the manager by populating the database
		 * */
		constructor() {
			this.database = undefined;

			this.schedules = new Table("schedules",
				`(id INT NOT NULL AUTO_INCREMENT,
			guild_id VARCHAR(24) NOT NULL,
			PRIMARY KEY (id)
			)`);

			this.users = new Table("users",
				`(id INT NOT NULL AUTO_INCREMENT,
			user_id VARCHAR(18) NOT NULL,
			username VARCHAR(32) NOT NULL,
			discriminator VARCHAR(4) NOT NULL,
			PRIMARY KEY (id),
			KEY idx_users_user_id (user_id)
			);`);
			
			this.events = new Table("events",
				`(id INT NOT NULL AUTO_INCREMENT,
			schedule_id INT NOT NULL,
			event_id SMALLINT NOT NULL,
			event_name VARCHAR(128) NOT NULL,
			event_date DATETIME NOT NULL,
			event_owner VARCHAR(18) NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY unique_event_idx (schedule_id,event_id),
			KEY events_ibfk_2_idx (event_owner),
			CONSTRAINT unique_event UNIQUE (schedule_id, event_id),
			FOREIGN KEY (schedule_id)
			REFERENCES ${this.schedules.name}(id)
			ON UPDATE CASCADE
			ON DELETE CASCADE,
			CONSTRAINT events_ibfk_2
			FOREIGN KEY (event_owner)
			REFERENCES ${this.users.name}(user_id)
			ON UPDATE CASCADE
			ON DELETE CASCADE
			)`);

			this.eventMembers = new Table("members",
				`(event_id INT NOT NULL,
			user_id INT NOT NULL,
			schedule_id INT NOT NULL,
			PRIMARY KEY (schedule_id, event_id, user_id),
			FOREIGN KEY (event_id)
			REFERENCES ${this.events.name}(id)
			ON UPDATE CASCADE
			ON DELETE CASCADE,
			FOREIGN KEY (user_id)
			REFERENCES ${this.users.name}(id)
			ON UPDATE CASCADE
			ON DELETE CASCADE,
			FOREIGN KEY (schedule_id)
			REFERENCES ${this.schedules.name}(id)
			ON UPDATE CASCADE
			ON DELETE CASCADE
			)`);
		}

		/**
		* Check if an event id exists for a given guild
		* @param {number} eventId The ID of the event to check existence for
		* @param {string} guildId The ID of the guild to check for event existence
		* @returns {Promise<boolean>} a promise that resolves with true if event exists, false otherwise.
		*/
		public async hasEvent(eventId: number, guildId: number) : Promise<any> {

			const that = this;

			return new Promise((resolve, reject)=> {

				/*
				 * get the schedule id based on the server we're checking event existence for
				 */
				const sql =
					`SELECT id FROM ${that.schedules.name} 
					 WHERE guild_id = ${guildId};` //<TODO: Turn this statement into JOIN

				/*
				 * query the database to determine if an event exists
				 */
				that.database!.query(sql)
					.then((result) => {
						const scheduleId = result[0].id;

						/*
						 * attempt retrieval of an event that matches the eventId
						 */
						return that.database!.query(
							`SELECT id FROM ${that.events.name}
					WHERE schedule_id=${scheduleId}
					AND event_id=${eventId};`
						).then((result: any) => {

							//return success or failure based on whether a result was retrieved.
							return resolve(result.length > 0);

						}).catch((error: mysql.MysqlError) => {
							console.log(error);
							return reject(error);
						});
					});

				return reject();
			});

		}

		/**
		* Set a schedule based on its guildId
		* @param {Schedule} schedule The schedule to set, based on the database information
		* @param {string} guildId The ID of the guild we are setting the schedule for
		*/
		public async setSchedule(schedule : Schedule, guildId: string, client: SchedulerClient) : Promise<void>{

			//Get the database Schedule id we want to work with
			this.database!.query(
				`SELECT id FROM ${this.schedules.name}
		WHERE guild_id = ${guildId};`
			).then(async (result) => {

				//the ID of the schedule we want to work with
				var scheduleId: number;

				/*
				 * if no results, create an entry in the database for the guild;
				 * then enter events in the schedule
				 */
				if (result!.length === 0) {

					//Get inserted row ID to get the id primary key from the schedules table
					const rowId = await this.database!.query(
						`INSERT INTO ${this.schedules.name} (guild_id)
				VALUES (${guildId});`).then((result) => {
							return result.insertId;
						});

					//Get the id primary key from the schedules table
					scheduleId = await this.database!.query(
						`SELECT id FROM ${this.schedules.name}
				WHERE id = ${rowId};`).then((result) => {
							return result[0].id;
						});
				} else {
					scheduleId = result![0].id;
				}

				/*
				 * Query for events in this schedule
				 */
				this.database!.query(
					`SELECT * FROM ${this.events.name} 
			WHERE schedule_id = ${scheduleId};`
				).then((result) => {

					console.log(result);

					/*
					 * Process events' data, put into schedule
					 */
					result.forEach((eventData: any) => {

						/*
						 * TODO: determine how to serialize event type in database for reproduction here
						 * Enum?
						 */

						client.users.fetch(eventData.event_owner)
							.then((owner: Discord.User) => {

							/*
							 * recreate the event from the database;
							 * the date has an ISO representation of milliseconds + timezone character at the end, so that
							 * the date may be interpreted without offset here, as it was interpreted that way when being placed into the database
							 */
							const event = new AutofireEvent(owner, eventData.event_name, new Date(eventData.event_date + `.000z`));
							schedule.readdEvent(event, eventData.event_id);

							//console.log(schedule);

							/*
							 * Add users to the events
							 */
							this.database!.query(
								`SELECT user_id FROM ${this.eventMembers.name}
					WHERE event_id = ${eventData.id}
					AND schedule_id = ${scheduleId};`
							).then((result) => {

								/*
								 * Get user info to create the Discord.User object
								 */
								result.forEach((memberId: any) => {

									this.database!.query(
										`SELECT * FROM ${this.users.name}
							WHERE id = ${memberId.user_id};`
									).then((result) => {
										result.forEach((userData: any) => {
											const user = new Discord.User(client, {
												id: `${userData.user_id}`,
												username: `${userData.username}`,
												discriminator: `${userData.discriminator}`,
												bot: false
											});

											/*
											 * Add the user to the event they were previously in
											 */
											schedule.rejoinEvent(user, eventData.event_id);
										});
									});

								});
							}).catch((error) => {
								console.error(error);
								process.exit(0);
							});
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
		private async createTable (table: Table) {
			return this.database!.query(table.sqlCreate);
		}

		/**
		 * Add an event to the database
		 * @param {ScheduleEvent} event The event to add to the database
		 * @param {number} eventId The ID of the event
		 * @param {string} guildId the ID of the guild
		 */
		public async addEvent(event: ScheduleEvent, owner: Discord.User, eventId: number, guildId: string) {

			//extract the date from the event, and parse to get a workable date string
			const date = event.date.toISOString().split('.')[0];


			const sql = `SELECT id FROM ${this.schedules.name}
		WHERE guild_id = ${guildId};`;

			this.database!.query(sql)
				.then((result) => {
					var scheduleId: number = result![0].id;


					this.database!.query(`INSERT IGNORE INTO ${this.users.name} (user_id, username, discriminator)
										 VALUES ('${owner.id}', '${owner.username}', '${owner.discriminator}')`).then((ownerExists) => {
											 this.database!.query(
												 `INSERT INTO ${this.events.name} (schedule_id, event_owner, event_id, event_name, event_date)
												  VALUES (${scheduleId}, '${owner.id}', ${eventId}, '${event.name}', STR_TO_DATE('${date}','%Y-%m-%dT%H:%i:%s'));`
											 );
						});

					
				}).catch((error) => {
					console.error(error);
				});
		}

		/**
		 * Remove an event from the database
		 * @param {number} eventId the ID of the event to remove
		 * @param {string} guildId the ID of the guild to remove from
		 */
		public async removeEvent(eventId: number, guildId: string) {
			this.database!.query(
				`DELETE FROM ${this.events.name}
		WHERE event_id = ${eventId} AND
		schedule_id = (SELECT id FROM ${this.schedules.name}
		WHERE guild_id=${guildId});`
			).catch((error) => {
				console.error(error);
			});
		}

		/**
		 * Add a user to an event in the database
		 * @param {Discord.User} user the User to add to the event
		 * @param {number} eventId the ID of the event
		 * @param {string} guildId the ID of the server
		 */
		public async addUser(user: Discord.User, eventId:number , guildId:string ) {
			const sql =
				`SELECT id FROM ${this.users.name} 
		WHERE user_id = ${user.id};`;

			this.database!.query(sql)
				.then(async (result) => {

					var userId: number;

					/*
					 * If the user doesn't exist in the database, insert and select them
					 * to obtain their unique id in the users table
					 */
					if (result!.length === 0) {

						//insert the user into the database
						await this.database!.query(
							`INSERT INTO ${this.users.name} (user_id, username, discriminator)
					VALUES ('${user.id}', '${user.username}', '${user.discriminator}');`).then((result) => {
								return result![0].decimals;
							});

						//Get the id primary key from the users table
						userId = await this.database!.query(sql)
							.then((result) => {
								return result![0].id;
							});
					} else {
						userId = result![0].id;
					}

					/*
					 * Select the schedule we are working with in the database
					 */
					this.database!.query(
						`SELECT id FROM ${this.schedules.name}
				WHERE guild_id = ${guildId};`
					).then((result) => {
						const scheduleId = result![0].id;

						this.database!.query(
							`SELECT id FROM ${this.events.name}
					WHERE event_id = ${eventId} 
					AND schedule_id = ${scheduleId};`
						).then((result) => {

							const eventDatabaseId = result![0].id;

							this.database!.query(
								`INSERT INTO ${this.eventMembers.name} (schedule_id, event_id, user_id)
						VALUES (${scheduleId}, ${eventDatabaseId}, ${userId});`
							);

						}).catch((error) => {
							console.error(error);
						});

					}).catch((error) => {
						console.error(error);
					});

				}).catch((error) => {
					console.error(error);
				});
		}

		/**
		 * Remove a user from an event in the database
		 * @param {Discord.User} user the user to remove from the event
		 * @param {number} eventId the ID of the event
		 * @param {string} guildId the ID of the server
		 */
		public async removeUser(user: Discord.User, eventId: number, guildId: string) {
			const sql =
				`SELECT id FROM ${this.users.name} 
		WHERE user_id = ${user.id};`;

			this.database!.query(sql)
				.then((result) => {
					const userId = result![0].id;

					this.database!.query(
						`SELECT id FROM ${this.schedules.name}
				WHERE guild_id = ${guildId};`
					).then((result) => {
						const scheduleId = result![0].id;

						this.database!.query(
							`SELECT id FROM ${this.events.name}
					WHERE event_id = ${eventId}
					AND schedule_id = ${scheduleId};`
						).then((result) => {

							const eventDatabaseId = result![0].id;

							this.database!.query(
								`DELETE FROM ${this.eventMembers.name}
						WHERE event_id = ${eventDatabaseId}
						AND schedule_id = ${scheduleId}
						AND user_id = ${userId};`
							).then((result) => {
								console.log(result);
							});
						}).catch((error) => {
							console.log(error);
						});
					}).catch((error) => {
						console.log(error);
					});
				}).catch((error) => {
					console.log(error);
				});
		}

		/**
		 * Initialize the database manager
		 * @param {Object} dbConfig The configuration for mysql and the database
		 * @returns {Promise} A promise to resolve when the database skeleton has been created
		 */
		public async Init (dbConfig: IDBConfigLayout) {

			//create a new database wrapper to support database querying with promises
			const database = new DatabaseWrapper(dbConfig);
			this.database = database;

			const that = this;

			return new Promise((resolve, reject) => {

				/*
				 * Chain table creation in the database for initialization
				 */
				that.database!.init()
					.then((result) => {
						console.log("Created & Connected to Database!");

						/*
						 * Set interval database querying to prevent loss of the connection
						 */
						setInterval(function () {
							that.database!.query('SELECT 1');
						}, 45000);

						return that.createTable(that.schedules);
					})
					.then((result) => {
						console.log(`Created Table ${that.events.name}!`);

						return that.createTable(that.users);
					})
					.then((result) => {
						console.log(`Created Table ${that.schedules.name}!`);

						return that.createTable(that.events);
					})
					.then((result) => {
						console.log(`Created Table ${that.users.name}!`);

						return that.createTable(that.eventMembers);
					})
					.then((result) => {
						console.log(`Created Table ${that.eventMembers.name}`);

						return resolve('Created all tables!');
					})
					.catch((err) => {
						database.close();
						console.log("Closed database out of initialization error");

						return reject(err);
					});
			});
		}
	}

}
