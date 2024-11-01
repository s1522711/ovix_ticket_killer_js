const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content:`Websocket heartbeat: ${interaction.client.ws.ping}ms.`, fetchReply: true });
		interaction.editReply(`${sent.content}\nlatency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
	},
};
