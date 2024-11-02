const { SlashCommandBuilder } = require('discord.js');
const state = require('../../state');
const { staffRoleId, upEmoji, downEmoji, updatingEmoji } = require('../../config.json');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('product-status')
		.setDescription('See the current killing status of tickets.'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has('0x0000000000000008')) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		const gtaEmoji = state.status.gtaStatus === 1 ? upEmoji : state.status.gtaStatus === 0 ? downEmoji : updatingEmoji;
		const rdr2Emoji = state.status.rdr2Status === 1 ? upEmoji : state.status.rdr2Status === 0 ? downEmoji : updatingEmoji;
		const cs2Emoji = state.status.cs2Status === 1 ? upEmoji : state.status.cs2Status === 0 ? downEmoji : updatingEmoji;
		const apiEmoji = state.status.apiStatus === 1 ? upEmoji : state.status.apiStatus === 0 ? downEmoji : updatingEmoji;
		interaction.reply(`Product status:\nGTA: ${gtaEmoji}\nRDR2: ${rdr2Emoji}\nCS2: ${cs2Emoji}\nAPI: ${apiEmoji}`);
	},
};