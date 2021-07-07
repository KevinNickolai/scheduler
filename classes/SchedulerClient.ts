import * as Discord from "discord.js";
import { DatabaseManager } from "./database/databaseManager";
import { Schedule } from "./schedule";

export default class SchedulerClient extends Discord.Client {

	public readonly database: DatabaseManager.DatabaseManager;
	public readonly scheduler: Map<string, Schedule>;
	public commands: Map<string, any>;

	constructor() {
		super();
		this.database = new DatabaseManager.DatabaseManager();
		this.scheduler = new Map <string, Schedule>();
		this.commands = new Map<string, any>();
	}
}
