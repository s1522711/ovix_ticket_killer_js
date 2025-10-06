const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const path = require('path');
const fs = require('fs');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
		}
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		// Add other folders as needed
		const commandFolders = ['utility', 'tickets', 'products'];
		let commandPath;

		for (const folder of commandFolders) {
			const potentialPath = path.join(__dirname, '..', folder, `${command.data.name}.js`);
			if (fs.existsSync(potentialPath)) {
				commandPath = potentialPath;
				break;
			}
		}

		if (!commandPath) {
			return interaction.reply(`Could not find the command file for \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(commandPath)];

		try {
			const newCommand = require(commandPath);
			await interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}

	},
};
