const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const state = require('../../state');
const { updateStatusMessage, updateCodeMessage } = require('../../statusAndLastState');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('change-code')
		.setDescription('Set the code for the tickets')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.addStringOption(option =>
			option.setName('code')
				.setDescription('Set what killing status to change to')
				.setRequired(true)
				.setMinLength(4)
				.setMaxLength(4))
		.addStringOption(option =>
			option.setName('validate')
				.setDescription('Set the ticket type to change')
				.setRequired(true)
				.setMinLength(4)
				.setMaxLength(4)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		await interaction.deferReply();

		const code = interaction.options.getString('code');
		const validate = interaction.options.getString('validate');

		if (validate !== code) {
			return interaction.editReply({ content: 'The code and the validation code do not match.', ephemeral: true });
		}
		else if (code === state.killing.ticketCode) {
			return interaction.editReply({ content: 'The code is already set to that.', ephemeral: true });
		}
		// if the code is not numeric
		else if (isNaN(code)) {
			return interaction.editReply({ content: 'The code must be a 4 digit number.', ephemeral: true });
		}

		state.killing.lastCode = state.killing.ticketCode;
		state.killing.ticketCode = code;
		await updateStatusMessage(interaction.client);
		await updateCodeMessage(interaction.client);

		interaction.editReply(`The code for the tickets has been set to \`${code}\`.`);
	},
};