const { Events } = require('discord.js');
const state = require('../state');
const { updateStatusMessage, doLastState, randomizeCode } = require('../statusAndLastState');
const { ticketCodeRandomSchedule } = require('../config.json');
const { logToConsole } = require('../logger');
const { Timeouts } = require('../timeoutsDb');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Create the timeouts table if it doesn't exist
		await Timeouts.sync();
		logToConsole(`Ready! Logged in as ${client.user.tag}`);
		doLastState();
		logToConsole(`time to randomize code: ${ticketCodeRandomSchedule} minutes`);
		// Schedule the randomizeCode function to run every ticketCodeRandomSchedule minutes
		setInterval(() => {
			randomizeCode(client);
		}, ticketCodeRandomSchedule * 1000 * 60);
		await randomizeCode(client);
		// print the global variables
		logToConsole(`gtaKill: ${state.killing.gtaKill}`);
		logToConsole(`rdr2Kill: ${state.killing.rdr2Kill}`);
		logToConsole(`cs2Kill: ${state.killing.cs2Kill}`);
		logToConsole(`unverifiedKill: ${state.killing.unverifiedKill}`);
		logToConsole(`giveawayKill: ${state.killing.giveawayKill}`);
		logToConsole(`requireCode: ${state.killing.requireCode}`);
		logToConsole(`lastCode: ${state.killing.lastCode}`);
		logToConsole(`ticketCreationCode: ${state.killing.ticketCode}`);
		logToConsole(`randomizeCode: ${state.killing.randomizeCode}`);
		logToConsole(`apiStatus: ${state.status.apiStatus}`);
		logToConsole(`gtaStatus: ${state.status.gtaStatus}`);
		logToConsole(`rdr2Status: ${state.status.rdr2Status}`);
		logToConsole(`cs2Status: ${state.status.cs2Status}`);
		logToConsole(`statusMessageId: ${state.statusMessageId}`);
		logToConsole(`ticketCodeMessageId: ${state.ticketCodeMessageId}`);
		updateStatusMessage(client);
		console.log('----------------------------------------------------------------------------');
	},
};

