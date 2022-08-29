// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const { token, emojiID_limehands, emojiID_rubiks } = require('./config.json');
const fetch = require('node-fetch');


// Require database models
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});
const { Users, Messages } = require('./dbObjects.js');
const UsersDb = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const MessagesDb = require('./models/Messages.js')(sequelize, Sequelize.DataTypes);

// Create necessary instances
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// Set up the discord api query
const query = {
	method: 'GET',
	headers: {
		Authorization: `Bot ${token}`,
	},
};

// Global variable to hold previous api calls last message id
let globalBefore = '';

// Read files in event folder (for handling discord events)
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));


let limeHandsCount = 0;
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Client is ready!');

	const textChannels = client.channels.cache.filter(channel => channel.isText());

	// TODO loop through every text channel in sequence (rate limited)
	// loop recursively until data.length becomes false
	// first message of general = 939296691889254430
	// getMessagesFromTextChannel(textChannels.last())
	//	.then(data => console.log(data));


	// For each channel, get that channels messageManager, fetch the messages within, then for each message
	// search for the wanted emoji
	// const textChannels = client.channels.cache.filter(channel => channel.isText());
	textChannels.each(textChannel => (textChannel.messages.fetch()
		.then(messages => messages.filter(m => m.reactions.cache.forEach((key, val) => {
			if (val === emojiID_rubiks) {
				console.log(`--- Target reaction found in text channel ${textChannel} ---`);
				console.log(`Message "${m.cleanContent}"\n with id ${m.id} by author ${m.author.username} has ${key.count} emoji(s)`);
				MessagesDb.upsert({ id: m.id,
					text: m.cleanContent,
					author: m.author.username,
					link: m.url,
					reactionsCount: key.count });
				limeHandsCount += key.count;
				console.log(`Total Limehands: ${limeHandsCount}`);
			}
		})),
		)
	));

	verifyDb();
	/*
	textChannels.each(textChannel => (textChannel.messages.fetch()
		.then(messages.each(m => m.reactions.cache.forEach((key, val) => {
			if (key === '<:rubiks:939620562639147008>') {
				console.log('found it!');
			}
		})))
	));*/
});

// https://discord.com/api/channels/{channel.id}/messages
// https://discord.com/developers/docs/resources/channel#get-channel-messages
// before can be '&before=${lastMessageID}' and the call will get 100 messages before that one
async function getMessagesFromTextChannel(textChannel, localBefore = '', rateLimit = 0) {

	await sleep(rateLimit);
	// Make the api call
	return fetch(`https://discord.com/api/channels/${textChannel.id}/messages?limit=100${localBefore}`, query)
		.then(response => parseJSONData(response))
		.then(jsonData => setupNextLoop(jsonData, textChannel));
}

async function parseJSONData(input) {
	const output = await input.json();
	return output;
}

function setupNextLoop(jsonData, textChannel) {
	if (jsonData.length) {
		globalBefore = `&before=${jsonData[jsonData.length - 1].id}`;
		return getMessagesFromTextChannel(textChannel, `&before=${jsonData[jsonData.length - 1].id}`);
	}
	else if (jsonData.retry_after) {
		console.log(`Rate limited... waiting for ${jsonData.retry_after} ms`);
		return getMessagesFromTextChannel(textChannel, globalBefore, jsonData.retry_after);
	}
	else {
		console.log('Got all messages in the channel');
		return;
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyDb() {
	console.log('\n--- Checking database ---');
	const users = await Users.findAll();
	users.forEach(u => console.log(`User_id: ${u.user_id}\nUsername: ${u.username}`));
	const messages = await Messages.findAll();
	messages.forEach(m => console.log(`Message_id: ${m.id}\nText: ${m.text}\nAuthor: ${m.author}\nLink: ${m.link}\nCount: ${m.reactionsCount}`));
}


// Login to Discord with your client's token
client.login(token);

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

