module.exports = {
	name: 'edit',
	aliases: ['change', 'modify'],
	description: "Edit an event.",
	usage: "<command name>",
	args: true,
	serverUnique: true,
	execute(message, args) {
		const serverId = message.guild.id;
		const schedule = message.client.scheduler.get(serverId);

		//TODO: determine how to edit messages based on event id & which user is requesting to change things
	}
}