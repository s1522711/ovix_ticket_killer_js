const { SlashCommandBuilder } = require('discord.js');
const { randomizeCode } = require('../../statusAndLastState');
const state = require('../../state');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('randomize-code')
		.setDescription('randomize the ticket code'),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}
		await interaction.deferReply();
		await randomizeCode(interaction.client);
		interaction.editReply(`Code randomized. New code: \`${state.killing.ticketCode}\``);
	},
};
