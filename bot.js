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

// Carrega os eventos
fs.readdir('./events', (err, files) => {
    if (err) return console.error('Erro ao carregar eventos:', err);
    files.forEach((file) => {
        if (!file.endsWith('.js')) return;
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

// Carrega os comandos
client.commands = new Map();
const commandsDir = './commands';
fs.readdir(commandsDir, (err, files) => {
    if (err) return console.error('Erro ao carregar comandos:', err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const command = require(`${commandsDir}/${file}`);
        client.commands.set(command.name, command);
    });
});

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

// Inicia o servidor express (opcional)
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

// Login do bot
client.login(config.token).catch((e) => {
    console.log('TOKEN ERROR❌  - Ative intenções ou redefina novo token');
});
