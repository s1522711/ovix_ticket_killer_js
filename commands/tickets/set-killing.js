const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const { modRoleId, ticketCodeRandomSchedule } = require('../../config.json');
const state = require('../../state');
const { updateStatusMessage } = require('../../statusAndLastState');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('set-killing')
		.setDescription('Set the killing status of tickets')
		.addStringOption(option =>
			option.setName('kill')
				.setDescription('Set what killing status to change to')
				.setRequired(true)
				.addChoices(
					{ name: 'Kill', value: 'kill' },
					{ name: 'Dont Kill', value: 'unkill' },
				))
		.addStringOption(option =>
			option.setName('ticket')
				.setDescription('Set the ticket type to change')
				.setRequired(true)
				.addChoices(
					{ name: 'GTA', value: 'gta' },
					{ name: 'RDR2', value: 'rdr2' },
					{ name: 'CS2', value: 'cs2' },
					{ name: 'Unverified', value: 'unverified' },
					{ name: 'Giveaway', value: 'giveaway' },
					{ name: 'Recovery Serivce', value: 'recovery' },
					{ name: 'Require Code', value: 'requireCode' },
					{ name: 'Randomize Code', value: 'randomizeCode' },
					{ name: 'All Main Tickets', value: 'allMainTickets' },
				)),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(modRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		const killing = interaction.options.getString('kill') === 'kill';
		const ticket = interaction.options.getString('ticket');

		switch (ticket) {
		case 'gta':
			state.killing.gtaKill = killing;
			break;
		case 'rdr2':
			state.killing.rdr2Kill = killing;
			break;
		case 'cs2':
			state.killing.cs2Kill = killing;
			break;
		case 'unverified':
			state.killing.unverifiedKill = killing;
			break;
		case 'giveaway':
			state.killing.giveawayKill = killing;
			break;
		case 'recovery':
			state.killing.recoveryKill = killing;
			break;
		case 'requireCode':
			state.killing.requireCode = killing;
			break;
		case 'randomizeCode':
			state.killing.randomizeCode = killing;
			break;
		case 'allMainTickets':
			state.killing.gtaKill = killing;
			state.killing.rdr2Kill = killing;
			state.killing.cs2Kill = killing;
			state.killing.unverifiedKill = killing;
			break;
		default:
			return interaction.reply({ content: 'Invalid ticket type.', flags: MessageFlags.Ephemeral });
		}

		updateStatusMessage(interaction.client);

		if (ticket === 'requireCode') {
			interaction.reply(`Require code set to ${killing ? 'Yes' : 'No'}, Code: \`${state.killing.ticketCode}\`.`);
		}
		else if (ticket === 'randomizeCode') {
			interaction.reply(`Randomize code set to ${killing ? 'Yes' : 'No'}, interval: \`${ticketCodeRandomSchedule} minutes\`.`);
		}
		else if (ticket === 'allMainTickets') {
			interaction.reply(`Killing status of all main tickets set to ${killing ? 'kill' : 'dont kill'}.`);
		}
		else {
			interaction.reply(`Killing status of ${ticket} tickets set to ${killing ? 'kill' : 'dont kill'}.`);
		}
	},
};