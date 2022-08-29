// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const LimehandsDB = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/Messages.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

const addDatabaseEntries = async () => {
	const users = client.users.cache;
	console.log(users.entries());
	for (let i = 0; i < users.size; i++) {
		await LimehandsDB.upsert({ user_id: users.at(i).id, username: users.at(i).username });
		console.log(`added an entry---\nuser_id: ${users.at(i).id}\nusername: ${users.at(i).username}`);
	}
	console.log('Database synced');
	sequelize.close();
};

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');

	sequelize.sync({ force }).then(async () => {
		addDatabaseEntries();
	}).catch(console.error);
});

// Login to Discord with your client's token
client.login(token);