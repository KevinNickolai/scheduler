module.exports = (client, message) => {

	const { prefix } = require('../config.js');

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	console.log(`message received: ${message.content}`);
}