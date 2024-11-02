const { Events } = require('discord.js');
const state = require('../state');
const later = require('@breejs/later');
const { updateStatusMessage, doLastState, randomizeCode } = require('../statusAndLastState');
const { ticketCodeRandomSchedule } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		doLastState();
		const schedule = later.parse.recur().every(ticketCodeRandomSchedule).minute();
		later.setInterval(async () => {
			randomizeCode(client);
		}, schedule);
		await randomizeCode(client);
		// print the global variables
		console.log(`gtaKill: ${state.killing.gtaKill}`);
		console.log(`rdr2Kill: ${state.killing.rdr2Kill}`);
		console.log(`cs2Kill: ${state.killing.cs2Kill}`);
		console.log(`unverifiedKill: ${state.killing.unverifiedKill}`);
		console.log(`giveawayKill: ${state.killing.giveawayKill}`);
		console.log(`requireCode: ${state.killing.requireCode}`);
		console.log(`ticketCreationCode: ${state.killing.ticketCode}`);
		console.log(`randomizeCode: ${state.killing.randomizeCode}`);
		console.log(`apiStatus: ${state.status.apiStatus}`);
		console.log(`gtaStatus: ${state.status.gtaStatus}`);
		console.log(`rdr2Status: ${state.status.rdr2Status}`);
		console.log(`cs2Status: ${state.status.cs2Status}`);
		console.log(`statusMessageId: ${state.statusMessageId}`);
		console.log(`ticketCodeMessageId: ${state.ticketCodeMessageId}`);
		updateStatusMessage(client);
	},
};

