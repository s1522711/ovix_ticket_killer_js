const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { modRoleId } = require('../../config.json');
const state = require('../../state');
const { updateStatusMessage } = require('../../statusAndLastState');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('set-product-status')
		.setDescription('Set the killing status of tickets')
		.addStringOption(option =>
			option.setName('status')
				.setDescription('Set what killing status to change to')
				.setRequired(true)
				.addChoices(
					{ name: 'Down', value: 'down' },
					{ name: 'Up', value: 'up' },
					{ name: 'Updating', value: 'updating' },
				))
		.addStringOption(option =>
			option.setName('product')
				.setDescription('Set the ticket type to change')
				.setRequired(true)
				.addChoices(
					{ name: 'GTA', value: 'gta' },
					{ name: 'RDR2', value: 'rdr2' },
					{ name: 'CS2', value: 'cs2' },
					{ name: 'API', value: 'api' },
				)),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(modRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		const status = interaction.options.getString('status');
		const product = interaction.options.getString('product');

		switch (product) {
		case 'gta':
			state.status.gtaStatus = status === 'up' ? 1 : status === 'down' ? 0 : 2;
			break;
		case 'rdr2':
			state.status.rdr2Status = status === 'up' ? 1 : status === 'down' ? 0 : 2;
			break;
		case 'cs2':
			state.status.cs2Status = status === 'up' ? 1 : status === 'down' ? 0 : 2;
			break;
		case 'api':
			state.status.apiStatus = status === 'up' ? 1 : status === 'down' ? 0 : 2;
			break;
		default:
			return interaction.reply({ content: 'Invalid product type.', ephemeral: true });
		}

		await updateStatusMessage(interaction.client);

		interaction.reply(`Killing status of ${product} tickets set to ${status === 'up' ? 'Up' : status === 'down' ? 'Down' : 'Updating'}.`);
	},
};