const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Timeouts } = require('../../timeoutsDb');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('add-user-ping')
		.setDescription('Adds a user to the database of people that have been timed out for pinging staff.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to add to the database')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('The amount of pings the user has done')
				.setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount') ?? 1;
		// Find the user in the database
		const timeout = await Timeouts.findOne({ where: { user_id: user.id } });
		if (!timeout) {
			// Create a new user in the database
			await Timeouts.create({ user_id: user.id, amount: amount, last_ping: new Date() });
		}
		else {
			// Update the amount of pings
			await timeout.update({ amount: timeout.amount + amount });
		}
		await interaction.editReply(`The user ${user.tag} has been added to the database.`);
	},
};