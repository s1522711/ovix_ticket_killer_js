const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { modRoleId } = require('../../config.json');
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
					{ name: 'Require Code', value: 'requireCode' },
					{ name: 'Randomize Code', value: 'randomizeCode' },
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
		case 'requireCode':
			state.killing.requireCode = killing;
			break;
		case 'randomizeCode':
			state.killing.randomizeCode = killing;
			break;
		default:
			return interaction.reply({ content: 'Invalid ticket type.', ephemeral: true });
		}

		updateStatusMessage(interaction.client);

		if (ticket === 'requireCode') {
			interaction.reply(`Require code set to ${killing ? 'Yes' : 'No'}, code is ${state.killing.ticketCode}.`);
		}
		else if (ticket === 'randomizeCode') {
			interaction.reply(`Randomize code set to ${killing ? 'Yes' : 'No'}.`);
		}
		else {
			interaction.reply(`Killing status of ${ticket} tickets set to ${killing ? 'kill' : 'dont kill'}.`);
		}
	},
};