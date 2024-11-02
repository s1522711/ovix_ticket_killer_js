function logToConsole(message) {
	console.log(`[${new Date().toLocaleString()}] ${message}`);
}

module.exports = {
	logToConsole,
};