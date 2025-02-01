const { Events } = require('discord.js');
// const client = require('../index');
const { staffRoleId, trialStaffRoleId } = require('../config.json');
const { logToConsole } = require('../logger');
const { handleMention } = require('./messageCreate');

module.exports = {
	name: Events.MessageDelete,
	async execute(message) {
		if (message.author.bot) {
			return;
		}

		if (message.reference) {
			await handleReply(message);
		}
	},
};

async function handleReply(message) {
	// if the message author is a staff member / trial staff member / a bot / admin\
	if (message.member.roles.cache.has(staffRoleId) || message.member.roles.cache.has(trialStaffRoleId) || message.author.bot || message.member.permissions.has('0x0000000000000008')) {
		return;
	}

	// check if the message was deleted no more than 10 seconds after it was sent
	const now = new Date();
	const messageTime = new Date(message.createdTimestamp);
	const diff = now - messageTime;
	if (diff > 10000) {
		return;
	}
	logToConsole(`Message deleted within 10 seconds of being sent: ${message.content}`);
	await handleMention(message, true);
}