// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const { token } = require('./config.json');
const fetch = require('node-fetch');

// Create necessary instances
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// Read files in event folder (for handling discord events)
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));


// let limeHandsCount = 0;
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Client is ready!');

	const textChannels = client.channels.cache.filter(channel => channel.isText());

	// TODO loop through every text channel
	// TODO create a thread for each text channel and call getMess...loop recursively until no more before
	getMessagesFromTextChannel(textChannels.last())
		.then(data => console.log(data[data.length - 1]));


	/*
	// For each channel, get that channels messageManager, fetch the messages within, then for each message
	// search for the wanted emoji key
	const textChannels = client.channels.cache.filter(channel => channel.isText());
	textChannels.each(textChannel => (textChannel.messages.fetch()
		.then(messages => messages.filter(m => m.reactions.cache.forEach((val, key) => {
			if (key === '939620562639147008') {
				console.log(`Message with id ${val.id} has ${val.count} emoji(s)`);
				limeHandsCount += val.count;
				console.log(`Total Limehands: ${limeHandsCount}`);
			}
		})),
		)
	));

	textChannels.each(textChannel => (textChannel.messages.fetch()
		.then(messages.each(m => m.reactions.cache.forEach((val, key) => {
			if (key === '<:rubiks:939620562639147008>') {
				console.log('found it!');
			}
		)))
	));*/
});

// https://discord.com/api/channels/{channel.id}/messages
// https://discord.com/developers/docs/resources/channel#get-channel-messages
// before can be '&before=${lastMessageID}' and the call will get 100 messages before that one
async function getMessagesFromTextChannel(textChannel, before = '') {
	// Set up the api query
	const query = {
		method: 'GET',
		headers: {
			Authorization: `Bot ${token}`,
		},
	};

	// Make the api call
	return await fetch(`https://discord.com/api/channels/${textChannel.id}/messages?limit=100${before}`, query)
		.then(response => response.json());
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

