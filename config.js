require('dotenv').config()

const localDBConfig = {
	host: process.env.LOCAL_DATABASE_HOST,
	user: process.env.LOCAL_DATABASE_USER,
	password: process.env.LOCAL_DATABASE_PASSWORD,
	database: process.env.LOCAL_DATABASE_NAME
}

const testDBConfig = {
	host: process.env.TEST_DATABASE_HOST,
	user: process.env.TEST_DATABASE_USER,
	password: process.env.LOCAL_DATABASE_PASSWORD,
	database: process.env.LOCAL_DATABASE_NAME
}

const prodDBConfig = {
	host: process.env.PROD_DATABASE_HOST,
	user: process.env.PROD_DATABASE_USER,
	password: process.env.PROD_DATABASE_PASSWORD,
	database: process.env.PROD_DATABASE_NAME
}

const DBConfig = {
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME
}

module.exports = {
	prefix: '!',
	botToken: process.env.BOT_TOKEN,
	testBotToken: process.env.TEST_BOT_TOKEN,

	localDBConfig: localDBConfig,
	productionDBConfig: prodDBConfig,
	dbConfig: DBConfig,
	testDBConfig: testDBConfig
}