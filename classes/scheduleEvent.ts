import * as Discord from "discord.js";

/**
 * Abstract class defining a base event that
 * will handle logic for managing scheduled events
 * */
export abstract class ScheduleEvent {

	public readonly name: string;
	public readonly date: Date;
	public readonly users: Map<string, Discord.User>;

	public timeout: NodeJS.Timeout | undefined;

	/**
	 * constructor for a ScheduleEvent
	 * @param {string} name The name of the event
	 * @param {Date} date The date of the event
	 */
	constructor(name = 'default event name', date = new Date()) {

		//disables ScheduleEvent instantiation, making it abstract
		if (new.target === ScheduleEvent) {
			throw new TypeError("Cannot instantiate abstract ScheduleEvent class");
		}

		//require override of method displayEvent()
		if ((typeof this.displayEvent) != "function") {
			throw new TypeError("Must override method displayEvent()");
		}

		this.name = name;
		this.date = date;
		this.timeout;

		this.users = new Map<string, Discord.User>();
	}

	public abstract displayEvent(): void;

	/**
	* Add a user to the event
	* @param {Discord.User} user The discord user to add to the event
	*/
	public addUser (user: Discord.User) {

		//if the user attempting to join isn't already in the event
		if (!this.users.has(user.id)) {
			this.users.set(user.id, user);
			user.send(`You have joined event ${this.name}.`);
		} else {
			user.send(`You've already joined event ${this.name}!`);
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

		success ? user.send(`You have left event ${this.name}.`) : user.send(`You never joined event ${this.name}!`);
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
