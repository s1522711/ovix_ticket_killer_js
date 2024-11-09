const { Events } = require('discord.js');
// const client = require('../index');
const state = require('../state');
const { randomizeCode } = require('../statusAndLastState');
// get the user ID from the config.json file imported in the index.js file
const { tickettoolId, statusChannelId, staffRoleId, trialStaffRoleId, staffChatId, autoDeleteChannelIds, autoDeleteTime, clientId, pingTimeoutTime } = require('../config.json');
const { logToConsole } = require('../logger');
const { Timeouts } = require('../timeoutsDb');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.id === tickettoolId) {
			await handleTicket(message);
		}
		// if the message is in one of the auto-delete channels
		else if (autoDeleteChannelIds.includes(message.channel.id)) {
			await handleAutoDelete(message);
		}
		else if (message.author.bot) {
			// pass
		}
		else if (message.channel.type === 'DM') {
			// pass
		}
		// if the message mentions any user
		else if (message.mentions.users.size > 0) {
			await handleMention(message);
		}
	},
};

async function handleAutoDelete(message) {
	// if the message author is a staff member / trial staff member / a bot / admin
	if (message.member.roles.cache.has(staffRoleId) || message.member.roles.cache.has(trialStaffRoleId) || message.member.permissions.has('0x0000000000000008') && (!message.author.bot || message.author.id === clientId)) {
		return;
	}

	logToConsole(`Auto-deleting message from ${message.author.tag} in ${message.channel.name}, content: ${message.content}`);

	// delete the message after a certain amount of time
	try {
		await new Promise(resolve => setTimeout(resolve, autoDeleteTime * 1000));
		await message.delete();
	}
	catch (error) {
		if (error.code === 10008) {
			logToConsole('Message already deleted');
		}
	}

}


async function handleMention(message) {
	// if the message author is a staff member / trial staff member / a bot / admin\
	if (message.member.roles.cache.has(staffRoleId) || message.member.roles.cache.has(trialStaffRoleId) || message.author.bot || message.member.permissions.has('0x0000000000000008')) {
		return;
	}

	// if the message is a reply to a message, ignore it
	if (message.reference) {
		return;
	}

	const mentionedUsers = message.mentions.members;
	for (const member of mentionedUsers) {
		if (member[1].roles.cache.has(staffRoleId) || member[1].roles.cache.has(trialStaffRoleId)) {
			// look for the user in the timeouts table and get all the data
			const [timeout] = await Timeouts.findOrCreate({ where: { user_id: message.author.id } });
			// if the last ping was more than a week ago or the user has never pinged staff
			if (!timeout.last_ping || (Date.now() - timeout.last_ping.getTime()) > 604800000) {
			// if (!timeout.last_ping || (Date.now() - timeout.last_ping.getTime()) > 30 * 1000) {
				// set the last ping to the current time
				timeout.last_ping = new Date();
				// set the amount of pings to 1
				timeout.amount = 1;
				// save the data to the database
				await timeout.save();
			}
			// if the last ping was less than a week ago
			else {
				// increment the amount of pings
				timeout.amount++;
				// set the last ping to the current time
				timeout.last_ping = new Date();
				// save the data to the database
				await timeout.save();
			}

			logToConsole(`Mentioned user ${member[1].user.tag} has a staff role. Timeout amount: ${timeout.amount}, Last ping: ${timeout.last_ping}`);
			logToConsole(`Message: ${message.content}, Author: ${message.author.tag}, Channel: ${message.channel.name}, category: ${message.channel.parent.name}`);
			// send a message to the staff chat
			const expiryTimestamp = `<t:${Math.round((timeout.last_ping.getTime() + 604800000) / 1000)}:d>`;
			await message.client.channels.cache.get(staffChatId).send(`<@${message.author.id}> pinged staff in <#${message.channel.id}>, this is their ${timeout.amount} ping this week. Their multiplier expires on ${expiryTimestamp}.`);

			// timeout the user for a certain amount of time
			message.member.timeout(pingTimeoutTime * 1000 * timeout.amount, `bot auto-timeout for pinging staff - ${timeout.amount} times this week`);

			for (let i = 0; i < 5; i++) {
				message.channel.send(`Please dont ping staff! <@${message.author.id}>`);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			message.channel.send('Hope you understand :)');
		}
	}
}

async function handleTicket(message) {
	if (!message.content.includes('//')) {
		// pass
	}
	else if (message.content.toLowerCase().includes('//gta') && state.killing.gtaKill) {
		logToConsole('GTA ticket killed');
		message.channel.send(`Hello! the Gta category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'GTA DISABLED');
	}
	else if (message.content.toLowerCase().includes('//rdr') && state.killing.rdr2Kill) {
		logToConsole('RDR2 ticket killed');
		message.channel.send(`Hello! the Rdr2 category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'RDR2 DISABLED');
	}
	else if (message.content.toLowerCase().includes('//cs') && state.killing.cs2Kill) {
		logToConsole('CS2 ticket killed');
		message.channel.send(`Hello! the Cs2 category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'CS2 DISABLED');
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && state.killing.giveawayKill) {
		logToConsole('Giveaway ticket killed');
		message.channel.send(`Hello! the Giveaway category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'GIVEAWAY DISABLED');
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && !message.content.toLowerCase().includes('//ye')) {
		logToConsole('invalid Giveaway ticket killed');
		message.channel.send('Hello! these tickets are only for entering giveaways!');
		await closeTicket(message, 'GIVEAWAY INVALID');
	}
	else if (message.content.toLowerCase().includes('//pswrd//') && state.killing.unverifiedKill) {
		logToConsole('killable Unverified ticket killed');
		message.channel.send(`Hello! the Unverified category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'UNVERIFIED DISABLED');
	}
	else if (message.content.toLowerCase().includes('//pswrd//') && !message.content.toLowerCase().includes('//ye')) {
		logToConsole('invalid Unverified ticket killed');
		message.channel.send('Hello! these tickets are only for requesting a password reset for your account!');
		await closeTicket(message, 'UNVERIFIED INVALID');
	}
	// if the message contains the correct content for stuff
	else if (message.content.toLowerCase().includes('//pswrd//') && message.content.toLowerCase().includes('//ye')) {
		logToConsole('valid Unverified ticket');
		const reason = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nType: Unverified, Reason: ${reason}`;
		messageContent += '\nPlease do not ping staff we will get to you as soon as possible.';
		message.channel.send(messageContent);
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && message.content.toLowerCase().includes('//ye')) {
		logToConsole('valid Giveaway ticket');
		const understood = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nType: Giveaway Claim, Understood: ${understood}`;
		messageContent += '\nPlease do not ping staff, we will get to you as soon as possible.';
		message.channel.send(messageContent);
	}
	// if the message doesnt contain the correct code
	else if (!(message.content.toLowerCase().includes(state.killing.ticketCode) || message.content.toLowerCase().includes(state.killing.lastCode)) && message.content.toLowerCase().includes('//') && state.killing.requireCode) {
		logToConsole('invalid ticket killed - doesnt contain code');
		message.channel.send('Hello! this is an invalid ticket, please make sure you are using the correct code.');
		await closeTicket(message, 'INVALID CODE');
	}
	// if the message doesnt contain yes in the right embed field
	else if (!message.embeds[1].description.toLowerCase().split('**have you read #common-questions?**')[1].split('\n')[1].includes('ye') && message.content.toLowerCase().includes('//')) {
		logToConsole('invalid ticket killed - doesnt contain yes');
		message.channel.send('Hello! this is an invalid ticket, please make sure you that you have read the common questions!');
		await closeTicket(message, 'INVALID CODE');
	}
	// if the message contains the correct content for the rest of the tickets
	else if (message.content.toLowerCase().includes('//')) {
		// randomize the code after a good ticket is opened
		const reason = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		const readStatus = message.embeds[1].description.split('\n')[7].replaceAll('`', '');
		const game = message.content.split('//')[1];
		const code = message.content.split('//')[2];
		logToConsole(`ticket opened for ${game}, reason: ${reason}, read status: ${readStatus}, code: ${code}`);
		if (message.content.includes(state.killing.lastCode)) logToConsole('Last code used'); else logToConsole('New code used');
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nGame: ${game}, Reason: ${reason}, Read? ${readStatus}`;
		messageContent += '\nPlease do not ping staff, we will get to you as soon as possible.';
		message.channel.send(messageContent);
		await randomizeCode(message.client);
	}
}

async function closeTicket(message, type) {
	// send a normal message to the channel
	const channel = message.channel;
	channel.send('this ticket will be closed in 5 seconds');
	// noinspection DuplicatedCode
	await new Promise(resolve => setTimeout(resolve, 1000));
	// display a 5-second countdown
	let lastMst = await channel.send('5');
	for (let i = 4; i > 0; i--) {
		// edit the last message
		await new Promise(resolve => setTimeout(resolve, 1000));
		lastMst = await lastMst.edit(i.toString());
	}
	await new Promise(resolve => setTimeout(resolve, 1000));
	await lastMst.edit('0 - Goodbye!');

	// Close the channel
	await new Promise(resolve => setTimeout(resolve, 500));
	await channel.send(`$close Bot autoclose - ${type}`);
	await new Promise(resolve => setTimeout(resolve, 500));
	await channel.send('$transcript');
	await new Promise(resolve => setTimeout(resolve, 500));
	await channel.send('$delete');
}