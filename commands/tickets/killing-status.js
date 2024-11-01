const { SlashCommandBuilder } = require('discord.js');
const state = require('../../state');
const { staffRoleId, trialStaffRoleId, upEmoji, downEmoji, ticketCreationCode } = require('../../config.json');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('killing-status')
		.setDescription('See the current killing status of tickets.'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.roles.cache.has(trialStaffRoleId) && !interaction.member.permissions.has('0x0000000000000008')) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		const gtaEmoji = state.gtaKill ? downEmoji : upEmoji;
		const rdr2Emoji = state.rdr2Kill ? downEmoji : upEmoji;
		const cs2Emoji = state.cs2Kill ? downEmoji : upEmoji;
		const unverifiedEmoji = state.unverifiedKill ? downEmoji : upEmoji;
		const giveawayEmoji = state.giveawayKill ? downEmoji : upEmoji;
		interaction.reply(`Killing status of tickets:\nGTA: ${gtaEmoji}\nRDR2: ${rdr2Emoji}\nCS2: ${cs2Emoji}\nUnverified: ${unverifiedEmoji}\nGiveaway: ${giveawayEmoji}\nRequire code: ${state.requireCode ? 'Yes' : 'No'}, code: ${ticketCreationCode}`);
	},
};