import { AutofireEvent } from "./autofireEvent";
import * as Discord from "discord.js";
import { IDurationEvent } from "./Interfaces/IDurationEvent";
/**
 * Class that describes a Schedule Event that will fire at a specific datetime
 * */
export class DurationAutofireEvent extends AutofireEvent implements IDurationEvent {

	readonly start: Date;
	public readonly end: Date;

	/**
	 * DurationAutofireEvent Constructor
	 * @param {string} name the name of the event
	 * @param {Date} date the date the event will fire
	 */
	constructor(owner: Discord.User, name: string, dateFire: Date) {
		super(owner, name, dateFire);
		this.start = dateFire;

		this.end = new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate(), this.start.getHours() + 1, this.start.getMinutes(), this.start.getSeconds(), this.start.getMilliseconds()); 
	}

	/**
	* Display the autofire event information
	* @returns {string} the event displayed in a proper format.
	* */
	displayEvent() {

		let display = `${this.name}, autofiring on ${this.date.toDateString()} at ${this.date.toTimeString()} until `;

		if (this.start.getDate() === this.end.getDate()) {
			display = display + `${this.end.toTimeString()} `;
		}
		else {
			display = display + `${this.end.toDateString()} at ${this.end.toTimeString()} `;
		}

		display = display + `with ${this.users.size} member(s).`;

		return display;
	}
}
