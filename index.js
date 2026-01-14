const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { logToConsole } = require('./logger');

logToConsole('Starting bot...');


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// export the global variables to be used in other files

// Create a new Collection to hold your commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

client.cooldowns = new Collection();

// Grab all the command files from the commands directory you created earlier
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			logToConsole(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Grab all the event files from the events directory you created earlier
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// module.exports = client;

// Listen for uncaught exceptions
process.on('uncaughtException', (err) => {
    try {
        // Find the highest crash log number
        const logFiles = fs.readdirSync(__dirname).filter(f => f.match(/^crash\d+\.log$/));
        let highestNum = 0;
        logFiles.forEach(f => {
            const num = parseInt(f.match(/\d+/)[0]);
            if (num > highestNum) highestNum = num;
        });
        
        const nextNum = highestNum + 1;
        const logFilePath = path.join(__dirname, `crash${nextNum}.log`);
        const errorDetails = `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`;
        
        // Use synchronous write to ensure the log is saved before exit
        fs.writeFileSync(logFilePath, errorDetails);
        console.error('Error logged to file. Process exiting.');
    } catch (logErr) {
        console.error('Failed to write error to log file:', logErr);
    }
    
    // It is best practice to exit the process after an uncaught exception
    // to prevent running in an unstable state.
    process.exit(1); 
});


client.login(token);
