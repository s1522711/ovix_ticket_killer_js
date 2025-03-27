const fs = require('fs');
const state = require('./state');
const { EmbedBuilder } = require('discord.js');
const { statusChannelId, upEmoji, downEmoji, updatingEmoji, defaultTicketCreationCode, ticketCodeMessageChannelId, statpingApiToken, statpingApiUrl } = require('./config.json');
const { logToConsole } = require('./logger');

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
			state.killing.gtaKill = lastState.killing.gtaKill;
			state.killing.rdr2Kill = lastState.killing.rdr2Kill;
			state.killing.cs2Kill = lastState.killing.cs2Kill;
			state.killing.unverifiedKill = lastState.killing.unverifiedKill;
			state.killing.giveawayKill = lastState.killing.giveawayKill;
			state.killing.recoveryKill = lastState.killing.recoveryKill;
			state.killing.requireCode = lastState.killing.requireCode;
			state.killing.ticketCode = lastState.killing.ticketCode;
			state.killing.lastCode = lastState.killing.lastCode;
			state.killing.randomizeCode = lastState.killing.randomizeCode;
			// status
			state.status.apiStatus = lastState.status.apiStatus;
			state.status.gtaStatus = lastState.status.gtaStatus;
			state.status.rdr2Status = lastState.status.rdr2Status;
			state.status.cs2Status = lastState.status.cs2Status;
			// statusMessageId
			state.statusMessageId = lastState.statusMessageId;
			// ticketCodeMessageId
			state.ticketCodeMessageId = lastState.ticketCodeMessageId;

			// if any of the values are undefined, rebuild the file
			if (state.killing.gtaKill === undefined || state.killing.rdr2Kill === undefined || state.killing.cs2Kill === undefined || state.killing.unverifiedKill === undefined || state.killing.giveawayKill === undefined || state.killing.recoveryKill === undefined || state.status.apiStatus === undefined || state.status.gtaStatus === undefined || state.status.rdr2Status === undefined || state.status.cs2Status === undefined || state.statusMessageId === undefined || state.statusMessageId === '' || state.killing.ticketCode === undefined || state.killing.ticketCode === '' || state.killing.requireCode === undefined || state.ticketCodeMessageId === undefined || state.ticketCodeMessageId === '' || state.killing.randomizeCode === undefined || state.killing.lastCode === undefined) {
				logToConsole('One or more values in lastState.json are undefined, rebuilding last state...');
				rebuildLastState();
			}
		}
		catch (error) {
			// if there is an error reading the file, rebuild it
			logToConsole(`${error.message}`);
			logToConsole('Error reading lastState.json, rebuilding last state...');
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
			gtaKill: false,
			rdr2Kill: false,
			cs2Kill: false,
			unverifiedKill: false,
			giveawayKill: false,
			recoveryKill: false,
			requireCode: true,
			ticketCode: defaultTicketCreationCode,
			lastCode: defaultTicketCreationCode,
			randomizeCode: true,
		},
		status: {
			apiStatus: 1,
			gtaStatus: 1,
			rdr2Status: 1,
			cs2Status: 1,
		},
		statusMessageId: 'none',
		ticketCodeMessageId: 'none',
	};
	fs.writeFileSync('./lastState.json', JSON.stringify(lastState, null, 2));
	logToConsole('Rebuilt last state.');
	doLastState();
}

function updateLastState() {
	/*
	const lastState = {
		killing: {
			gta: state.gtaKill,
			rdr2: state.rdr2Kill,
			cs2: state.cs2Kill,
			unverified: state.unverifiedKill,
			giveaway: state.giveawayKill,
			recovery: state.recoveryKill,
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
	*/
	fs.writeFileSync('./lastState.json', JSON.stringify(state, null, 2));
}

async function updateStatusMessage(client) {
	updateStatpingStatus();
	updateLastState();
	const embed1 = new EmbedBuilder()
		.setTitle('Status Guide')
		.setDescription(`**${upEmoji} | Online**\n**${downEmoji} | Offline**\n**${updatingEmoji} | Updating**`)
		.setColor('DarkGrey');
	const embed2GtaLine = `Grand Theft Auto 5: ${state.status.gtaStatus === 1 ? upEmoji : state.status.gtaStatus === 0 ? downEmoji : updatingEmoji}`;
	const embed2Rdr2Line = `Red Dead Redemption 2: ${state.status.rdr2Status === 1 ? upEmoji : state.status.rdr2Status === 0 ? downEmoji : updatingEmoji}`;
	const embed2Cs2Line = `Counter-Strike 2: ${state.status.cs2Status === 1 ? upEmoji : state.status.cs2Status === 0 ? downEmoji : updatingEmoji}`;
	const embed2ApiLine = `Website and API: ${state.status.apiStatus === 1 ? upEmoji : state.status.apiStatus === 0 ? downEmoji : updatingEmoji}`;
	const embed2RecoveryLine = `Recovery Service: ${state.killing.recoveryKill ? downEmoji : upEmoji}`;
	const embed2 = new EmbedBuilder()
		.setTitle('Product Status')
		.setDescription(`${embed2GtaLine}\n${embed2Rdr2Line}\n${embed2Cs2Line}\n${embed2ApiLine}\n${embed2RecoveryLine}`)
		.setColor('DarkGrey');
	const embed3GtaLine = `Grand Theft Auto 5: ${state.killing.gtaKill ? downEmoji : upEmoji}`;
	const embed3Rdr2Line = `Red Dead Redemption 2: ${state.killing.rdr2Kill ? downEmoji : upEmoji}`;
	const embed3Cs2Line = `Counter-Strike 2: ${state.killing.cs2Kill ? downEmoji : upEmoji}`;
	const embed3UnverifiedLine = `Unverified: ${state.killing.unverifiedKill ? downEmoji : upEmoji}`;
	const embed3GiveawayLine = `Giveaway: ${state.killing.giveawayKill ? downEmoji : upEmoji}`;
	const embed3RecoveryLine = `Recovery Service: ${state.killing.recoveryKill ? downEmoji : upEmoji}`;
	const embed3 = new EmbedBuilder()
		.setTitle('Ticket Status')
		.setDescription(`${embed3GtaLine}\n${embed3Rdr2Line}\n${embed3Cs2Line}\n${embed3UnverifiedLine}\n${embed3GiveawayLine}\n${embed3RecoveryLine}`)
		.setColor('DarkGrey');


	if (state.statusMessageId !== '' && state.statusMessageId !== 'none' && state.statusMessageId !== undefined && state.statusMessageId !== null) {
		client.channels.cache.get(statusChannelId).messages.fetch(state.statusMessageId)
			.then(message => {
				message.edit({ embeds: [embed1, embed2, embed3] });
				updateLastState();
			})
			.catch(error => {
				logToConsole(`${error.message}`);
				logToConsole('Error fetching status message, rebuilding last state...');
				rebuildLastState();
			});
	}
	if ((state.statusMessageId === 'none' && state.statusMessageId !== '') && state.statusMessageId !== undefined && state.statusMessageId !== null) {
		const sent = await client.channels.cache.get(statusChannelId).send({ embeds: [embed1, embed2, embed3] });
		state.statusMessageId = sent.id;
		updateLastState();
	}
}

async function updateStatpingStatus() {
	// do a quick get request to see if the server is online
	const options = {
		method: 'GET',
	};
	let response;
	try {
		response = await fetch(`${statpingApiUrl}/services?api=${statpingApiToken}`, options);
		logToConsole(`Statping API response: ${response.status}`);
	}
	catch (error) {
		logToConsole(`Statping API error: ${error.message}`);
		return;
	}

	// first do gta
	const gtaBody = {
		'online': state.status.gtaStatus === 1,
		'latency': 0,
		'issue': state.status.gtaStatus === 1 ? '' : 'Offline',
	};
	const gtaOptions = {
		method: 'PATCH',
		body: JSON.stringify(gtaBody),
	};
	response = await fetch(`${statpingApiUrl}/services/1?api=${statpingApiToken}`, gtaOptions);
	logToConsole(`Statping GTA response: ${response.status}`);
	// then rdr2
	const rdr2Body = {
		'online': state.status.rdr2Status === 1,
		'latency': 0,
		'issue': state.status.rdr2Status === 1 ? '' : 'Offline',
	};
	const rdr2Options = {
		method: 'PATCH',
		body: JSON.stringify(rdr2Body),
	};
	response = await fetch(`${statpingApiUrl}/services/2?api=${statpingApiToken}`, rdr2Options);
	logToConsole(`Statping RDR2 response: ${response.status}`);
	// then cs2
	const cs2Body = {
		'online': state.status.cs2Status === 1,
		'latency': 0,
		'issue': state.status.cs2Status === 1 ? '' : 'Offline',
	};
	const cs2Options = {
		method: 'PATCH',
		body: JSON.stringify(cs2Body),
	};
	response = await fetch(`${statpingApiUrl}/services/3?api=${statpingApiToken}`, cs2Options);
	logToConsole(`Statping CS2 response: ${response.status}`);
	// finally the api
	/*
	const apiBody = {
		'online': state.status.apiStatus === 1,
		'latency': 0,
		'issue': state.status.apiStatus === 1 ? '' : 'Offline',
	};
	const apiOptions = {
		method: 'PATCH',
		body: JSON.stringify(apiBody),
	};
	await fetch(`${statpingApiUrl}/services/ovix-api?api=${statpingApiToken}`, apiOptions);
	*/
}

async function randomizeCode(client) {
	let code = '';
	if (state.killing.randomizeCode) {
		const characters = '0123456789';
		for (let i = 0; i < 4; i++) {
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		}
	}
	else {
		code = state.killing.ticketCode;
	}

	state.killing.lastCode = state.killing.ticketCode;
	state.killing.ticketCode = code;
	// print the new ticket code along with the date and time
	logToConsole(`New ticket code: ${code}`);
	console.log('----------------------------------------------------------------------------');
	updateLastState();

	await updateCodeMessage(client);
}

async function updateCodeMessage(client) {
	const text = `TICKET CODE: ${state.killing.ticketCode}`;
	if (state.ticketCodeMessageId !== '' && state.ticketCodeMessageId !== 'none' && state.ticketCodeMessageId !== undefined && state.ticketCodeMessageId !== null) {
		client.channels.cache.get(ticketCodeMessageChannelId).messages.fetch(state.ticketCodeMessageId)
			.then(message => {
				message.edit(text);
				updateLastState();
			})
			.catch(error => {
				logToConsole(`${error.message}`);
				logToConsole('Error fetching code message, rebuilding last state...');
				rebuildLastState();
			});
	}
	if ((state.ticketCodeMessageId === 'none' && state.ticketCodeMessageId !== '') && state.ticketCodeMessageId !== undefined && state.ticketCodeMessageId !== null) {
		const sent = await client.channels.cache.get(ticketCodeMessageChannelId).send(text);
		state.ticketCodeMessageId = sent.id;
		updateLastState();
	}
}


module.exports = { updateStatusMessage, doLastState, randomizeCode, updateCodeMessage };
