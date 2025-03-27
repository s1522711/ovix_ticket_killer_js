const state = {
	killing: {
		gtaKill: false,
		rdr2Kill: false,
		cs2Kill: false,
		unverifiedKill: false,
		giveawayKill: false,
		recoveryKill: false,
		requireCode: false,
		ticketCode: 'none',
		lastCode: 'none',
		randomizeCode: false,
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

module.exports = state;