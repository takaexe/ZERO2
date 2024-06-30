const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.js');
const fs = require('fs');
const path = require('path');
const { printWatermark } = require('./util/pw');
const { initializePlayer } = require('./player');

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => GatewayIntentBits[a]),
});

client.config = config;
initializePlayer(client);

client.once('ready', () => {
    console.log(`Logado como ${client.user.tag}`);
    client.riffy.init(client.user.id);
    printWatermark();
});

// Carregar eventos
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    const eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));
}

// Carregar comandos
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('messageCreate', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Houve um erro ao executar o comando.');
    }
});

client.on('raw', (packet) => {
    if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) return;
    client.riffy.updateVoiceState(packet);
});

// Login do bot
client.login(config.token).catch((e) => {
    console.log('TOKEN ERROR❌  - Ative intenções ou redefina novo token');
});

// Servidor Express (opcional)
const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});
app.listen(port, () => {
    console.log(`🔗 Listening to Taka.exe : http://localhost:${port}`);
});
