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

sequelize.sync({ force }).then(async () => {
	const db = [
		LimehandsDB.upsert({ user_id: '0', username: 'test' }),
	];

	await Promise.all(db);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);