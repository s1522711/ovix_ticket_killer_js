const { Events } = require('discord.js');
const state = require('../state');
const { updateStatusMessage, doLastState } = require('../statusAndLastState');
const { ticketCreationCode } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		doLastState();
		// print the global variables
		console.log(`gtaKill: ${state.gtaKill}`);
		console.log(`rdr2Kill: ${state.rdr2Kill}`);
		console.log(`cs2Kill: ${state.cs2Kill}`);
		console.log(`unverifiedKill: ${state.unverifiedKill}`);
		console.log(`giveawayKill: ${state.giveawayKill}`);
		console.log(`requireCode: ${state.requireCode}`);
		console.log(`ticketCreationCode: ${ticketCreationCode}`);
		console.log(`apiStatus: ${state.apiStatus}`);
		console.log(`gtaStatus: ${state.gtaStatus}`);
		console.log(`rdr2Status: ${state.rdr2Status}`);
		console.log(`cs2Status: ${state.cs2Status}`);
		console.log(`statusMessageId: ${state.statusMessageId}`);
		updateStatusMessage(client);
	},
};

