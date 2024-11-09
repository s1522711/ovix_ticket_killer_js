const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const { Timeouts } = require('../../timeoutsDb');
const Sequelize = require('sequelize');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping-db')
		.setDescription('Returns the database content of the people that have been timed out for pinging staff.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		await interaction.deferReply();
		// Fetch all timeouts from the database where the last ping less than a week ago
		const timeouts = await Timeouts.findAll({ where: { last_ping: { [Sequelize.Op.gt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
		// construct a txt file with the user ids, the amount of pings, the last ping and the time when it will be removed (last ping + 7 days)
		// example: 1234567890, germani, 3, 2021-09-01T00:00:00.000Z, 2021-09-08T00:00:00.000Z
		let txt = await Promise.all(timeouts.map(async timeout => {
		  const username = await getUserName(interaction.client, timeout.user_id);
		  return `${timeout.user_id}, ${username}, ${timeout.amount}, ${timeout.last_ping.toISOString()}, ${new Date(timeout.last_ping.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()}`;
		})).then(results => results.join('\n'));

		txt = `user_id, username, amount, last_ping, remove_date\n${txt}`;
		// send the txt file
		await interaction.editReply({ content: 'Here is the database content of the people that have been timed out for pinging staff and their multiplier is still active:', files: [{ attachment: Buffer.from(txt, 'utf-8'), name: 'timeouts.txt' }] });
	},
};

async function getUserName(client, userId) {
	// get the user tag from fetching the user - make sure that the promise is resolved
	const user = await client.users.fetch(userId);
	return user.tag;
}