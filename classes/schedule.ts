import * as Discord from "discord.js";
import SchedulerClient from "./SchedulerClient";
import { ScheduleEvent } from "./events/scheduleEvent";
import { EventDispatcher, IEvent } from "ste-events";

export enum CalendarType {
	all,
	me,
	eventType
}

/**
 * A class that describes a schedule, to track and
 * maintain all of the events within the schedule.
 * */
export class Schedule {

	private _eventsChanged = new EventDispatcher<Schedule, ScheduleEvent>();

	public get onEventsChanged(): IEvent<Schedule, ScheduleEvent>
	{
		return this._eventsChanged.asEvent();
	}

	public readonly MAX_SCHEDULE_DAYS: number = 30;
	public readonly MAX_EVENTS: number = 100;
	public readonly DISPLAY_PAGE_SIZE: number = 10;

	public readonly events: Map<number, ScheduleEvent>;
	public channelId: string;
	public readonly guildId: string;

	public readonly client: SchedulerClient;

	/**
	 * Schedule Constructor
	 * @param {string} channelId The ID of the channel that the schedule will receive commands in
	 * @param {Discord.Client} client The client that the schedule is managed by
	 * @param {string} guildId The ID of the guild that the schedule belongs to
	 */
	constructor(channelId: string, client: SchedulerClient, guildId: string) {
		this.events = new Map();
		this.channelId = channelId;
		this.guildId = guildId;
		this.client = client;
	}

	public hasEvent(eventId: number): boolean {
		return this.events.has(eventId);
	}

	public eventHasUser(eventId: number, user: Discord.User): boolean {
		return this.events.has(eventId) ? this.events.get(eventId)!.users.has(user.id) : false;
	}

	/**
	* Add an event to the schedule
	* @param {ScheduleEvent} event the event to add to the schedule
	* @param {number} eventId the ID of the event to add to the schedule
	* @param {boolean} updateDatabase flag indicating if the database should be updated to reflect schedule changes
	* @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
	*/
	public add(event: ScheduleEvent, eventId: number, updateDatabase: boolean = true): Promise<number> {

		//persistent schedule reference for the upcoming promise chain
		const that = this;

		return new Promise((resolve, reject) => {
			if (that.isFull()) {
				return resolve(-1);
			}

			if (that.events.has(eventId)) {
				console.log(`ID ${eventId} in schedule with channelId ${that.channelId} already exists.`);
				return resolve(-1);
			}

			if (updateDatabase) {
				/*
				* Attempt addition of the event to the scheduling database
				*/
				that.client.database.addEvent(event, event.owner, eventId, that.guildId)
					.then((result) => {
						that.events.set(eventId, event);
						that.setEventTimer(eventId);
						that._eventsChanged.dispatch(that, event);
						return resolve(eventId);
					}).catch((error) => {
						console.log(error);
						return reject(error);
					});
			} else {
				that.events.set(eventId, event);
				that.setEventTimer(eventId);
				return resolve(eventId);
			}

		});
	}

	/**
	 * Display a calendar of upcoming events for the month
	 * @param {Discord.User} user the user requesting the calendar
	 * @param {CalendarType} calType the type of calendar to display
	 * @returns {string} a formatted string to appear as a calendar
	 */
	public calendar(user: Discord.User, calType: CalendarType = CalendarType.me): string {

		const currentDate = new Date();

		const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

		const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		//console.log(first);
		//console.log(last);


		let eventsUserIn = new Set();
		let allEventDays = new Set();

		for (var [key, val] of this.events) {
			if (+val.date >= +currentDate && +val.date <= +last) {

				switch (calType) {
					case CalendarType.all:
						allEventDays.add(val.date.getDate());
					case CalendarType.me:

						if (val.users.has(user.id)) {
							eventsUserIn.add(val.date.getDate());
						}

						break;
					case CalendarType.eventType:
						break;
				}


			}
		}
		

		let cldr = "";

		if (eventsUserIn.size > 0) {
			cldr = cldr + "#^ Your events   ";
		}

		if (allEventDays.size > 0) {
			cldr = cldr + "#* All Events    ";
		}

		let monthname = currentDate.toLocaleString("default", { month: "long" });
		
		let middleMonthNameIndex = Math.floor(monthname.length / 2);

		monthname = monthname.padStart(15 + middleMonthNameIndex, " ");
		monthname = monthname.padEnd(31, " ");

		
		cldr = cldr + `\n-------------------------------\n`
			+						monthname + "\n"
			+	        `   S   M   T   W   T   F   S   \n   `;
		for (var j = 0; j < first.getDay(); ++j) {
			cldr = cldr + `-   `;
		}

		for (var i = first; +i <= +last; i.setDate(i.getDate() + 1)) {

			let dayOfMonth = i.getDate();

			if (eventsUserIn.has(dayOfMonth)){

				if (i.getDate() < 9) {
					cldr = cldr + `${dayOfMonth}^  `;
				}
				else if (i.getDate() === 9) {
					cldr = cldr + `${dayOfMonth}^ `;
				}
				else {
					cldr = cldr + `${dayOfMonth}^ `;
				}

			}
			else if (allEventDays.has(dayOfMonth)) {
				if (i.getDate() < 9) {
					cldr = cldr + `${dayOfMonth}*  `;
				}
				else if (i.getDate() === 9) {
					cldr = cldr + `${dayOfMonth}* `;
				}
				else {
					cldr = cldr + `${dayOfMonth}* `;
				}
			}
			else {
				if (i.getDate() < 9) {
					cldr = cldr + `${dayOfMonth}   `;
				}
				else if (i.getDate() === 9) {
					cldr = cldr + `${dayOfMonth}  `;
				}
				else {
					cldr = cldr + ` ${dayOfMonth} `;
				}
			}

			if (i.getDay() === 6) { // saturday
				if (dayOfMonth + 1 < 10) {
					cldr = cldr + '\n   ';
				}
				else {
					cldr = cldr + '\n  ';
				}
				
			}

		}

		return cldr;

	}

	/**
	 * Add an event to the schedule
	 * @param {ScheduleEvent} event The event to add to the schedule
	 * @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
	 */
	public addEvent(event: ScheduleEvent): Promise<number> {
		return this.add(event, this.generateEventId());
	}


	/**
	 * Add an event that already exists to the schedule
	 * @param {ScheduleEvent} event The event to add to the schedule
	 * @param {number} eventId The ID of the event added
	 * @returns {Promise<number>} A promise resolving with the ID of the event added, -1 if unsuccessful to add
	 */
	public readdEvent(event : ScheduleEvent, eventId: number) : Promise<number> {
		return this.add(event, eventId, false);
	}

	/**
	 * Remove an event from the schedule
	 * @param {number} eventId The ID of the event to remove
	 * @returns {Promise<boolean>} true if removed successfully, false otherwise
	 */
	public removeEvent (eventId: number) : Promise<boolean>{

		//persistent schedule reference for the upcoming promise chain
		const that = this;

		return new Promise((resolve, reject) => {

			if (that.events.has(eventId)) {

				const event = that.events.get(eventId)!;

				that.client.database.removeEvent(eventId, that.guildId)
					.then(result => {
						event.clearEventTimeout();

						const deleted = that.events.delete(eventId);
						that._eventsChanged.dispatch(that, event);
						return resolve(deleted);
					}).catch(error => {
						return reject(false);
					});
			} else {
				return resolve(false);
			}
		});
	}

	/**
	 * join an event on the schedule
	 * @param {Discord.User} user The discord user that is joining the event
	 * @param {number} eventId The ID of the event that the user is joining
	 * @returns {Promise} A promise that resolves when the user has been added to the event
	 */
	public joinEvent(user: Discord.User, eventId: number) : Promise<void> {

		return new Promise((resolve, reject) => {
			const event = this.events.get(eventId);

			//check the existence of the event
			if (event) {
				this.client.database.addUser(user, eventId, this.guildId)
					.then((result) => {
						event.addUser(user);
						resolve();
					}).catch((error) => {
						console.log(error);
						reject(error);
					});

			} else {

				const error = `Event with ID ${eventId} does not exist.`;

				//user.messageError = error;

				user.send(error);
				resolve();
			}
		});
	}

	/**
	 * rejoin an event on the schedule
	 * @param {Discord.User} user The discord user that is rejoining the event
	 * @param {number} eventId The ID of the event that the user is rejoining
	 */
	public rejoinEvent(user: Discord.User, eventId: number) {
		const event = this.events.get(eventId)!;

		event.readdUser(user);
	}

	/**
	 * Leave an event on the schedule
	 * @param {Discord.User} user The user attempting to leave the event
	 * @param {number} eventId The ID of the event to leave
	 * @returns {Promise} A promise that resolves when the user has left the event
	 */
	public leaveEvent(user: Discord.User, eventId: number): Promise<void> {

		return new Promise((resolve, reject) => {

			const event = this.events.get(eventId);

			if (event) {

				this.client.database.removeUser(user, eventId, this.guildId)
					.then((result) => {
						event.removeUser(user);
						return resolve();
					}).catch(error => {
						return reject(error);
					});
			} else {

				const error = `Event with ID ${eventId} does not exist.`;

				//user.messageError = error;

				user.send(error);

				return resolve();
			}
		});

	}

	/**
	 * Set the timer for an event in the schedule to fire
	 * @param {number} eventId The ID of the event to set the timer for
	 */
	public setEventTimer(eventId: number) {

		const event = this.events.get(eventId)!;

		const timeToWait = event.date.getTime() - Date.now();

		if (timeToWait <= 0) {
			//do immediately
			this.fireEvent(eventId)
				.then((result) => {
					console.log(`Fired event ${eventId} successfully`);
				}).catch((error) => {
					console.error(error);
				});
		} else if (timeToWait <= 86400000) {
			//settimeout

			const that = this;

			event.timeout = setTimeout(function () {
				that.fireEvent(eventId)
					.then((result) => {
						console.log(`Fired event ${eventId} successfully`);
					}).catch((error) => {
						console.error(error);
					});
			}, timeToWait);

		} else {
			//wait
		}
	}

	/**
	 * flag to indicate if the schedule is full
	 * @returns {boolean} true if schedule full, false otherwise
	 * */
	public isFull() : boolean{
		return (this.events.size >= this.MAX_EVENTS);
	}

	/**
	 * Generate a random ID for the event
	 * @returns {number} the generated event ID
	 * */
	public generateEventId() : number{

		var randomId;

		do {
			randomId = Math.floor(Math.random() * 999) + 1;
		} while (this.events.has(randomId));

		return randomId;
	}

	/**
	 * Display the schedule
	 * @returns {string} the schedule's events, formatted to display on Discord
	 * */
	public display(page: number = 1): string {

		if (this.events.size === 0) {
			return "```The schedule is currently empty.```";
		}

		if (this.events.size <= this.DISPLAY_PAGE_SIZE) {

			var scheduleString = "```";

			var reactionToJoinIndex = 0;

			this.events.forEach((event, id) => {
				scheduleString += `${reactionToJoinIndex++}~ EventID ${id}: ` + event.displayEvent() + '\n\n';
			});

			scheduleString += "```";
			return scheduleString;
		}

		return "";

	}

	public displayFromMap(toDisplay: Map<number, ScheduleEvent>) : string {
		if (toDisplay.size === 0) {
			return "```This page of the schedule is empty.```";
		}

		let scheduleString = "```";

		var reactionToJoinIndex = 0;

		toDisplay.forEach((event, id) => {
			scheduleString += `${reactionToJoinIndex++}~ EventID ${id}: ` + event.displayEvent() + '\n\n';
		});

		scheduleString += "```";
		return scheduleString;
	}

	public displayEvents(page: number = 1): Map<number, ScheduleEvent> {

		let displayNumber = page * this.DISPLAY_PAGE_SIZE;

		let ret = new Map<number, ScheduleEvent>();

		if (displayNumber > this.events.size) {
			displayNumber = this.events.size;
		}

		let entries = Array.from(this.events.entries());

		for (var i = displayNumber - 1; i >= displayNumber - this.DISPLAY_PAGE_SIZE && i >= 0; --i) {
			ret.set(entries[i][0], entries[i][1]);
		}

		return ret;
	}

	/**
	 * Fire the event of the given eventId
	 * @param {number} eventId The ID associate to the event in the schedule
	 * @returns {Promise<boolean>} true if the event fired and was removed properly, false otherwise.
	 */
	public fireEvent(eventId: number) : Promise<boolean> {
		this.events.get(eventId)!.fire();

		return this.removeEvent(eventId);
	}

	/**
	 * Get the number of events currently in the schedule
	 * @returns {number} the number of events currently in the schedule
	 * */
	eventCount() : number {
		return this.events.size;
	}

	/**
	 * Clear the schedule of all events
	 * @returns {Promise} A promise resolving when the schedule is clear of events
	 * */
	public clearEvents() : Promise<void>{

		const that = this;

		return new Promise((resolve, reject) => {

			//convert the events schedule to a format that will evaluate
			//a promise for each event in the schedule, then resolve when all events are removed
			Promise.all(
				Array.from(that.events, ([eventId, event]) => {
					return that.removeEvent(eventId);
				})
			).then((result) => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
		});
	}

	/**
	 * Get the maximum number of events possible in the schedule
	 * @returns {number} the limit of events that can be in the schedule at once
	 * */
	public maxEvents() {
		return this.MAX_EVENTS;
	}
}
