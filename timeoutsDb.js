const Sequelize = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Timeouts = sequelize.define('timeouts', {
	user_id: {
		type: Sequelize.STRING,
		primaryKey: true,
	},
	amount: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1,
	},
	last_ping: {
		type: Sequelize.DATE,
		allowNull: true,
	},
});

module.exports = { Timeouts };