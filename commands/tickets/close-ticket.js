const { SlashCommandBuilder } = require('discord.js');
const { staffRoleId, trialStaffRoleId } = require('../../config.json');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('close-ticket')
		.setDescription('Automatically closes a ticket.'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.roles.cache.has(trialStaffRoleId) && !interaction.member.permissions.has('0x0000000000000008')) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}
		await interaction.reply({ content: 'This ticket will be closed in 5 seconds.', ephemeral: true });
		// send a normal message to the channel
		const channel = interaction.channel;
		channel.send('Hello! this ticket will be closed in 5 seconds');
		// display a 5-second countdown
		for (let i = 5; i > 0; i--) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			channel.send(`${i}`);
		}
		await channel.send('0 - Goodbye!');

		// Close the channel
		await new Promise(resolve => setTimeout(resolve, 500));
		await channel.send(`$close Bot autoclose - <@${interaction.user.id}>`);
		await new Promise(resolve => setTimeout(resolve, 500));
		await channel.send('$transcript');
		await new Promise(resolve => setTimeout(resolve, 500));
		await channel.send('$delete');
	},
};