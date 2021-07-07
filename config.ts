require('dotenv').config();

export interface IDBConfigLayout {
	host: string;
	user: string;
	password: string;
	database: string | undefined;
}

const localDBConfig: IDBConfigLayout = {
	host: process.env.LOCAL_DATABASE_HOST!,
	user: process.env.LOCAL_DATABASE_USER!,
	password: process.env.LOCAL_DATABASE_PASSWORD!,
	database: process.env.LOCAL_DATABASE_NAME!
}

const testDBConfig: IDBConfigLayout = {
	host: process.env.TEST_DATABASE_HOST!,
	user: process.env.TEST_DATABASE_USER!,
	password: process.env.LOCAL_DATABASE_PASSWORD!,
	database: process.env.LOCAL_DATABASE_NAME!
}

const prodDBConfig: IDBConfigLayout = {
	host: process.env.PROD_DATABASE_HOST!,
	user: process.env.PROD_DATABASE_USER!,
	password: process.env.PROD_DATABASE_PASSWORD!,
	database: process.env.PROD_DATABASE_NAME!
}

const DBConfig: IDBConfigLayout = {
	host: process.env.DATABASE_HOST!,
	user: process.env.DATABASE_USER!,
	password: process.env.DATABASE_PASSWORD!,
	database: process.env.DATABASE_NAME!
}

export const prefix = "!";
export const botToken = process.env.BOT_TOKEN;
export const testBotToken = process.env.TEST_BOT_TOKEN;
export default {
	localDBConfig,
	prodDBConfig,
	DBConfig,
	testDBConfig
};
