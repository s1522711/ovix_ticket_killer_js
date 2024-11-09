const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Timeouts } = require('../../timeoutsDb');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('remove-user-ping')
		.setDescription('Removes a user from the database of people that have been timed out for pinging staff.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to remove from the database')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		// Find the user in the database
		const timeout = await Timeouts.findOne({ where: { user_id: user.id } });
		if (!timeout) return interaction.editReply('This user is not in the database.');
		// Remove the user from the database
		await timeout.destroy();
		await interaction.editReply(`The user ${user.tag} has been removed from the database.`);
	},
};