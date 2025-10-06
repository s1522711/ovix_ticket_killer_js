const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');

const colorChoices = ['Default', 'White', 'Aqua', 'Green', 'Blue', 'Yellow', 'Purple', 'LuminousVividPink', 'Fuchsia', 'Gold', 'Orange', 'Red', 'Grey', 'Navy', 'DarkAqua', 'DarkGreen', 'DarkBlue', 'DarkPurple', 'DarkVividPink', 'DarkGold', 'DarkOrange', 'DarkRed', 'DarkGrey', 'DarkerGrey', 'LightGrey', 'DarkNavy', 'Blurple', 'Greyple', 'DarkButNotBlack', 'NotQuiteBlack', 'Random'];

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('send-embed')
		.setDescription('Send an embed into a channel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel to send the embed in')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The title of the embed')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('description')
				.setDescription('The description of the embed'))
		.addStringOption(option =>
			option.setName('color')
				.setDescription('The color of the embed as color string')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('footer')
				.setDescription('The footer of the embed'))
		.addStringOption(option =>
			option.setName('image')
				.setDescription('The image of the embed (URL)'))
		.addStringOption(option =>
			option.setName('thumbnail')
				.setDescription('The thumbnail of the embed (URL)'))
		.addStringOption(option =>
			option.setName('author')
				.setDescription('The author of the embed'))
		.addStringOption(option =>
			option.setName('author-icon')
				.setDescription('The icon of the author of the embed (URL)'))
		.addStringOption(option =>
			option.setName('fields')
				.setDescription('The fields of in JSON ( "[{"name": "field1", "value": "value1", "inline": "false"}, ...]" )'))
		.addBooleanOption(option =>
			option.setName('timestamp')
				.setDescription('The timestamp of the embed in ISO format'))
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The URL of the embed'))
		.addStringOption(option =>
			option.setName('author-url')
				.setDescription('The URL of the author of the embed'))
		.addStringOption(option =>
			option.setName('footer-icon')
				.setDescription('The icon of the footer of the embed (URL)')),
	async autocomplete(interaction) {
		// handle the autocompletion response (more on how to do that below)
		const focusedValue = interaction.options.getFocused();
		const filtered = colorChoices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
		// send the response - limited to 25 options
		await interaction.respond(
			filtered.slice(0, 25).map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		const color = interaction.options.getString('color');
		const footer = interaction.options.getString('footer');
		const image = interaction.options.getString('image');
		const thumbnail = interaction.options.getString('thumbnail');
		const author = interaction.options.getString('author');
		const authorIcon = interaction.options.getString('authorIcon');
		const fields = interaction.options.getString('fields');
		const timestamp = interaction.options.getBoolean('timestamp');
		const url = interaction.options.getString('url');
		const authorUrl = interaction.options.getString('authorUrl');
		const footerIcon = interaction.options.getString('footerIcon');

		if (color && !colorChoices.includes(color)) {
			return interaction.reply({ content: 'Invalid color choice.', flags: MessageFlags.Ephemeral });
		}

		const embed = new EmbedBuilder().setTitle(title);

		if (timestamp) {
			embed.setTimestamp();
		}
		if (description) {
			embed.setDescription(description);
		}
		if (color) {
			embed.setColor(color);
		}
		if (footer && footerIcon) {
			embed.setFooter({ text: footer, iconURL: footerIcon });
		}
		if (footer && !footerIcon) {
			embed.setFooter({ text: footer });
		}
		if (footerIcon && !footer) {
			embed.setFooter({ iconURL: footerIcon });
		}
		if (image) {
			embed.setImage(image);
		}
		if (thumbnail) {
			embed.setThumbnail(thumbnail);
		}
		if (author && authorIcon && authorUrl) {
			embed.setAuthor({ name: author, iconURL: authorIcon, url: authorUrl });
		}
		if (author && authorIcon && !authorUrl) {
			embed.setAuthor({ name: author, iconURL: authorIcon });
		}
		if (author && !authorIcon && authorUrl) {
			embed.setAuthor({ name: author, url: authorUrl });
		}
		if (author && !authorIcon && !authorUrl) {
			embed.setAuthor({ name: author });
		}
		if (url) {
			embed.setURL(url);
		}

		if (fields) {
			const parsedFields = JSON.parse(fields);
			const validFields = [];
			for (const field of parsedFields) {
				if (field.value && field.name && field.inline) {
					// add this field to validFields
					validFields.push({ name: field.name, value: field.value, inline: field.inline });
				}
				else if (field.value && field.name && !field.inline) {
					validFields.push({ name: field.name, value: field.value });
				}
				else {
					return interaction.reply({ content: 'Invalid field format.', ephemeral: true });
				}
			}
			embed.addFields(validFields);
		}

		await channel.send({ embeds: [embed] });
		interaction.reply({ content: 'Embed sent!', flags: MessageFlags.Ephemeral });
	},
};
