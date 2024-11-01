const fs = require('fs');
const state = require('./state');
const { EmbedBuilder } = require('discord.js');
const { statusChannelId, upEmoji, downEmoji, updatingEmoji, defaultTicketCreationCode } = require('./config.json');

function doLastState() {
	// check if lastState.json exists
	if (fs.existsSync('./lastState.json')) {
		try {
			// read the file
			const data = fs.readFileSync('./lastState.json');
			// parse the data
			const lastState = JSON.parse(data);
			// set the global variables to the values in the file
			// killing
			state.gtaKill = lastState.killing.gta;
			state.rdr2Kill = lastState.killing.rdr2;
			state.cs2Kill = lastState.killing.cs2;
			state.unverifiedKill = lastState.killing.unverified;
			state.giveawayKill = lastState.killing.giveaway;
			state.requireCode = lastState.killing.requireCode;
			state.ticketCode = lastState.killing.ticketCode;
			// status
			state.apiStatus = lastState.status.api;
			state.gtaStatus = lastState.status.gta;
			state.rdr2Status = lastState.status.rdr2;
			state.cs2Status = lastState.status.cs2;
			// statusMessageId
			state.statusMessageId = lastState.statusMessageId;

			// if any of the values are undefined, rebuild the file
			if (state.gtaKill === undefined || state.rdr2Kill === undefined || state.cs2Kill === undefined || state.unverifiedKill === undefined || state.giveawayKill === undefined || state.apiStatus === undefined || state.gtaStatus === undefined || state.rdr2Status === undefined || state.cs2Status === undefined || state.statusMessageId === undefined || state.statusMessageId === '' || state.ticketCode === undefined || state.ticketCode === '' || state.requireCode === undefined) {
				console.log('One or more values in lastState.json are undefined, rebuilding last state...');
				rebuildLastState();
			}
		}
		catch (error) {
			// if there is an error reading the file, rebuild it
			console.log(`${error.message}`);
			console.log('Error reading lastState.json, rebuilding last state...');
			rebuildLastState();
		}
	}
	else {
		rebuildLastState();
	}
}

function rebuildLastState() {
	const lastState = {
		killing: {
			gta: false,
			rdr2: false,
			cs2: false,
			unverified: false,
			giveaway: false,
			requireCode: true,
			ticketCode: defaultTicketCreationCode,
		},
		status: {
			api: 1,
			gta: 1,
			rdr2: 1,
			cs2: 1,
		},
		statusMessageId: 'none',
	};
	fs.writeFileSync('./lastState.json', JSON.stringify(lastState, null, 2));
	console.log('Rebuilt last state.');
	doLastState();
}

function updateLastState() {
	const lastState = {
		killing: {
			gta: state.gtaKill,
			rdr2: state.rdr2Kill,
			cs2: state.cs2Kill,
			unverified: state.unverifiedKill,
			giveaway: state.giveawayKill,
			requireCode: state.requireCode,
			ticketCode: state.ticketCode,
		},
		status: {
			api: state.apiStatus,
			gta: state.gtaStatus,
			rdr2: state.rdr2Status,
			cs2: state.cs2Status,
		},
		statusMessageId: state.statusMessageId,
	};
	fs.writeFileSync('./lastState.json', JSON.stringify(lastState, null, 2));
}

async function updateStatusMessage(client) {
	updateLastState();
	const embed1 = new EmbedBuilder()
		.setTitle('Status Guide')
		.setDescription(`**${upEmoji} | Online**\n**${downEmoji} | Offline**\n**${updatingEmoji} | Updating**`)
		.setColor('DarkGrey');
	const embed2GtaLine = `Grand Theft Auto 5: ${state.gtaStatus === 1 ? upEmoji : state.gtaStatus === 0 ? downEmoji : updatingEmoji}`;
	const embed2Rdr2Line = `Red Dead Redemption 2: ${state.rdr2Status === 1 ? upEmoji : state.rdr2Status === 0 ? downEmoji : updatingEmoji}`;
	const embed2Cs2Line = `Counter-Strike 2: ${state.cs2Status === 1 ? upEmoji : state.cs2Status === 0 ? downEmoji : updatingEmoji}`;
	const embed2ApiLine = `API: ${state.apiStatus === 1 ? upEmoji : state.apiStatus === 0 ? downEmoji : updatingEmoji}`;
	const embed2 = new EmbedBuilder()
		.setTitle('Product Status')
		.setDescription(`${embed2GtaLine}\n${embed2Rdr2Line}\n${embed2Cs2Line}\n${embed2ApiLine}`)
		.setColor('DarkGrey');
	const embed3GtaLine = `Grand Theft Auto 5: ${state.gtaKill ? downEmoji : upEmoji}`;
	const embed3Rdr2Line = `Red Dead Redemption 2: ${state.rdr2Kill ? downEmoji : upEmoji}`;
	const embed3Cs2Line = `Counter-Strike 2: ${state.cs2Kill ? downEmoji : upEmoji}`;
	const embed3UnverifiedLine = `Unverified: ${state.unverifiedKill ? downEmoji : upEmoji}`;
	const embed3GiveawayLine = `Giveaway: ${state.giveawayKill ? downEmoji : upEmoji}`;
	const embed3 = new EmbedBuilder()
		.setTitle('Ticket Status')
		.setDescription(`${embed3GtaLine}\n${embed3Rdr2Line}\n${embed3Cs2Line}\n${embed3UnverifiedLine}\n${embed3GiveawayLine}`)
		.setColor('DarkGrey');


	if (state.statusMessageId !== '' && state.statusMessageId !== 'none' && state.statusMessageId !== undefined && state.statusMessageId !== null) {
		client.channels.cache.get(statusChannelId).messages.fetch(state.statusMessageId)
			.then(message => {
				message.edit({ embeds: [embed1, embed2, embed3] });
				updateLastState();
			})
			.catch(error => {
				console.log(`${error.message}`);
				console.log('Error fetching status message, rebuilding last state...');
				rebuildLastState();
			});
	}
	if ((state.statusMessageId === 'none' && state.statusMessageId !== '') && state.statusMessageId !== undefined && state.statusMessageId !== null) {
		const sent = await client.channels.cache.get(statusChannelId).send({ embeds: [embed1, embed2, embed3] });
		state.statusMessageId = sent.id;
		updateLastState();
	}
}

module.exports = { updateStatusMessage, doLastState };
