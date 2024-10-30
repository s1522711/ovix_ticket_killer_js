const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply('pinging...');
		interaction.editReply(`latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
	},
};
