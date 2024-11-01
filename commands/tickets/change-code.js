const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const state = require('../../state');
const { updateStatusMessage } = require('../../statusAndLastState');

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
				.setMaxLength(10))
		.addStringOption(option =>
			option.setName('validate')
				.setDescription('Set the ticket type to change')
				.setRequired(true)
				.setMinLength(4)
				.setMaxLength(10)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		interaction.deferReply();

		const code = interaction.options.getString('code');
		const validate = interaction.options.getString('validate');

		if (validate !== code) {
			return interaction.followUp({ content: 'The code and the validation code do not match.', ephemeral: true });
		}

		state.ticketCode = code;
		await updateStatusMessage(interaction.client);

		interaction.followUp(`The code for the tickets has been set to \`${code}\`.`);
	},
};