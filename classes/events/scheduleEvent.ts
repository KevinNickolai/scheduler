import * as Discord from "discord.js";
import { EventDispatcher, IEvent } from "ste-events";

/**
 * Abstract class defining a base event that
 * will handle logic for managing scheduled events
 * */
export abstract class ScheduleEvent {


	private _usersChanged = new EventDispatcher<ScheduleEvent, Discord.User>();

	public get onEventsChanged(): IEvent<ScheduleEvent, Discord.User> {
		return this._usersChanged.asEvent();
	}

	public readonly name: string;
	public date: Date;
	public readonly users: Map<string, Discord.User>;

	public readonly owner: Discord.User;

	public timeout: NodeJS.Timeout | undefined;

	/**
	 * constructor for a ScheduleEvent
	 * @param {Discord.User} owner the creator and owner of the event
	 * @param {string} name The name of the event
	 * @param {Date} date The date of the event
	 */
	constructor(owner: Discord.User, name = 'default event name', date = new Date()) {

		//disables ScheduleEvent instantiation, making it abstract
		if (new.target === ScheduleEvent) {
			throw new TypeError("Cannot instantiate abstract ScheduleEvent class");
		}

		//require override of method displayEvent()
		if ((typeof this.displayEvent) !== "function") {
			throw new TypeError("Must override method displayEvent()");
		}

		this.name = name;
		this.date = date;
		this.owner = owner;
		this.timeout;

		this.users = new Map<string, Discord.User>();
		this.users.set(owner.id, owner);
	}

	public abstract displayEvent(): void;

	/**
	* Add a user to the event
	* @param {Discord.User} user The discord user to add to the event
	*/
	public addUser(user: Discord.User) {

		//if the user attempting to join isn't already in the event
		if (!this.users.has(user.id)) {
			this.users.set(user.id, user);
			this._usersChanged.dispatch(this, user);
			user.send(`You have joined event ${this.name}.`);
		} else {
			user.send(`You've already joined event ${this.name}!`);
		}
	}

	/**
	 * Modify the date of the event taking place
	 * @param date the new date of the event 
	 */
	public modifyDate(date: Date) {
		let now = new Date();

		if (+date > +now) {
			this.date = date;
		}

	}

	/**
	 * readd a user to the event
	 * @param {Discord.User} user the user to readd to the event.
	 */
	public readdUser(user: Discord.User) {
		this.users.set(user.id, user);
	}

	/**
	 * Remove a user from the event.
	 * @param {Discord.User} user The user attempting to leave the event
	 */
	public removeUser(user: Discord.User) {
		const success = this.users.delete(user.id);

		if (success) {
			user.send(`You have left event ${this.name}.`);
			this._usersChanged.dispatch(this, user);
		}
		else {
			user.send(`You never joined event ${this.name}!`);
		}
	}

	/**
	 * Clear the event's timeout function for firing
	 * */
	public clearEventTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	/**
	 * Fire the event to start it
	 * */
	public fire() {
		this.users.forEach(user => {
			user.send(`Event ${this.name} fired!`);
		});

		/**
		 * Dispose of event here
		 */
	}
}
