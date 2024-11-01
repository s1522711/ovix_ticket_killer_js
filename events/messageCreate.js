const { Events } = require('discord.js');
// const client = require('../index');
const state = require('../state');
// get the user ID from the config.json file imported in the index.js file
const { tickettoolId, statusChannelId, staffRoleId, trialStaffRoleId, staffChatId, autoDeleteChannelIds, autoDeleteTime, clientId } = require('../config.json');

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

	console.log(`Auto-deleting message from ${message.author.tag} in ${message.channel.name}, content: ${message.content}`);

	// delete the message after a certain amount of time
	try {
		await new Promise(resolve => setTimeout(resolve, autoDeleteTime * 1000));
		await message.delete();
	}
	catch (error) {
		if (error.code === 10008) {
			console.log('Message already deleted');
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
			console.log(`Mentioned user ${member[1].user.tag} has a staff role.`);
			console.log(`Message: ${message.content}, Author: ${message.author.tag}, Channel: ${message.channel.name}, category: ${message.channel.parent.name}`);

			// send a message to the staff chat
			await message.client.channels.cache.get(staffChatId).send(`<@${message.author.id}> pinged staff in <#${message.channel.id}>`);

			for (let i = 0; i < 5; i++) {
				message.channel.send(`Please dont ping staff! <@${message.author.id}>`);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			message.channel.send('Hope you understand :)');
		}
	}
}

async function handleTicket(message) {
	if (message.content.toLowerCase().includes('//gta') && state.gtaKill) {
		console.log('GTA ticket killed');
		message.channel.send(`Hello! the Gta category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'GTA DISABLED');
	}
	else if (message.content.toLowerCase().includes('//rdr') && state.rdr2Kill) {
		console.log('RDR2 ticket killed');
		message.channel.send(`Hello! the Rdr2 category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'RDR2 DISABLED');
	}
	else if (message.content.toLowerCase().includes('//cs') && state.cs2Kill) {
		console.log('CS2 ticket killed');
		message.channel.send(`Hello! the Cs2 category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'CS2 DISABLED');
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && state.giveawayKill) {
		console.log('Giveaway ticket killed');
		message.channel.send(`Hello! the Giveaway category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'GIVEAWAY DISABLED');
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && !message.content.toLowerCase().includes('//ye')) {
		console.log('invalid Giveaway ticket killed');
		message.channel.send('Hello! these tickets are only for entering giveaways!');
		await closeTicket(message, 'GIVEAWAY INVALID');
	}
	else if (message.content.toLowerCase().includes('//pswrd//') && state.unverifiedKill) {
		console.log('killable Unverified ticket killed');
		message.channel.send(`Hello! the Unverified category is currently closed, please check <#${statusChannelId}> to see when it will be available again.`);
		await closeTicket(message, 'UNVERIFIED DISABLED');
	}
	else if (message.content.toLowerCase().includes('//pswrd//') && !message.content.toLowerCase().includes('//ye')) {
		console.log('invalid Unverified ticket killed');
		message.channel.send('Hello! these tickets are only for requesting a password reset for your account!');
		await closeTicket(message, 'UNVERIFIED INVALID');
	}
	// if the message contains the correct content for stuff
	else if (message.content.toLowerCase().includes('//pswrd//') && message.content.toLowerCase().includes('//ye')) {
		console.log('valid Unverified ticket');
		const reason = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nType: Unverified, Reason: ${reason}`;
		messageContent += '\nPlease do not ping staff we will get to you as soon as possible.';
		message.channel.send(messageContent);
	}
	else if (message.content.toLowerCase().includes('//gvwy//') && message.content.toLowerCase().includes('//ye')) {
		console.log('valid Giveaway ticket');
		const understood = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nType: Giveaway Claim, Understood: ${understood}`;
		messageContent += '\nPlease do not ping staff, we will get to you as soon as possible.';
		message.channel.send(messageContent);
	}
	// if the message doesnt contain the correct code
	else if (!message.content.toLowerCase().includes(state.ticketCode) && message.content.toLowerCase().includes('//') && state.requireCode) {
		console.log('invalid ticket killed');
		message.channel.send('Hello! this is an invalid ticket, please make sure you are using the correct code.');
		await closeTicket(message, 'INVALID CODE');
	}
	// if the message contains the correct content for the rest of the tickets
	else if (message.content.toLowerCase().includes('//')) {
		const reason = message.embeds[1].description.split('\n')[1].replaceAll('`', '');
		const readStatus = message.embeds[1].description.split('\n')[7].replaceAll('`', '');
		const game = message.content.split('//')[1];
		console.log(`ticket opened for ${game}, reason: ${reason}, read status: ${readStatus}`);
		let messageContent = `||<@&${staffRoleId}> <@&${trialStaffRoleId}>||`;
		messageContent += `\nGame: ${game}, Reason: ${reason}, Read? ${readStatus}`;
		messageContent += '\nPlease do not ping staff, we will get to you as soon as possible.';
		message.channel.send(messageContent);
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