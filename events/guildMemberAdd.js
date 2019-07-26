module.exports = (client, member) => {
	member.send(`Welcome to ${member.guild.name}! 
	I am ${client.user.username}, the event scheduling robot.`);
}