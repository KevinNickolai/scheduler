import { ScheduleEvent } from "./events/scheduleEvent";

export enum EventType {
	duration,
	autofire,
	schedule
}

/**
 * Get a type of event from a user-entered string
 * @param {string} am_pm the 12hour indicator of AM or PM
 */
export function getEventType(type: string) : EventType {
	switch (type.toLowerCase()) {
		case "duration":
		case "dur":
		case "durationevent":
			return EventType.duration;
			break;

		case "autofire":
		case "auto":
		case "autofireevent":
			return EventType.autofire;
			break;

		default:
			return EventType.schedule;
	}
}
