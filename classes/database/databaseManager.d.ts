import Schedule from "../schedule";
import SchedulerClient from "../ClientWithDatabase";

export class DatabaseManager {
	setSchedule(schedule: Schedule.Schedule, guildId: number, client: SchedulerClient): any;
	public Init(DBConfig: { host: string | undefined; user: string | undefined; password: string | undefined; database: string | undefined; }): void;
	constructor();
}
