const { EmbedBuilder } = require('discord.js');
const { Riffy } = require("riffy");
const { prefix } = require('./config.json');
const fs = require("fs");

const nodes = [
    {
        host: "lavalink.oryzen.xyz",
        port: 80,
        password: "oryzen.xyz",
        secure: false
    },
];

const client = new Riffy(client, nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: "ytmsearch",
    restVersion: "v4"
});

client.on("ready", () => {
    client.riffy.init(client.user.id);
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "play") {
        const query = args.join(" ");
        const player = client.riffy.createConnection({
            guildId: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            deaf: true
        });

        const resolve = await client.riffy.resolve({ query: query, requester: message.author });
        const { loadType, tracks, playlistInfo } = resolve;

        if (loadType === 'playlist') {
            for (const track of resolve.tracks) {
                track.info.requester = message.author;
                player.queue.add(track);
            }
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: 'Added To Queue',
                    iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157218651179597884/1213-verified.gif?ex=6517cf5a&is=65167dda&hm=cf7bc8fb4414cb412587ade0af285b77569d2568214d6baab8702ddeb6c38ad5&',
                    url: 'https://discord.gg/xQF9f9yUEM'
                })
                .setDescription(`**Playlist Name : **${playlistInfo.name} \n**Tracks : **${tracks.length}`)
                .setColor('#14bdff')
                .setFooter({ text: 'Use queue command for more Information' });
            message.reply({ embeds: [embed] });
            if (!player.playing && !player.paused) return player.play();

        } else if (loadType === 'search' || loadType === 'track') {
            const track = tracks.shift();
            track.info.requester = message.author;
            player.queue.add(track);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: 'Added To Queue',
                    iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157218651179597884/1213-verified.gif?ex=6517cf5a&is=65167dda&hm=cf7bc8fb4414cb412587ade0af285b77569d2568214d6baab8702ddeb6c38ad5&',
                    url: 'https://discord.gg/xQF9f9yUEM'
                })
                .setDescription(`**${track.info.title} **has been queued up and is ready to play!`)
                .setColor('#14bdff')
                .setFooter({ text: 'Use queue command for more Information' });
            message.reply({ embeds: [embed] });

            if (!player.playing && !player.paused) return player.play();
        } else {
            return message.channel.send('There are no results found.');
        }
    } else if (command === "loop") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) return message.channel.send("No player available.");

        const loopOption = args[0];
        if (!loopOption) return message.channel.send("Please provide a loop option: **queue**, **track**, or **none**.");

        if (loopOption === "queue" || loopOption === "track" || loopOption === "none") {
            player.setLoop(loopOption);
            message.channel.send(`Loop set to: ${loopOption}`);
        } else {
            message.channel.send("Invalid loop option. Please choose `queue`, `track`, or `none`.");
        }
    } else if (command === "pause") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) return message.channel.send("No player available.");

        player.pause(true);
        const embed = new EmbedBuilder()
            .setAuthor({
                name: 'Playback Paused!',
                iconURL: 'https://cdn.discordapp.com/attachments/1175488636033175602/1175488720519049337/pause.png?ex=656b6a2e&is=6558f52e&hm=6695d8141e37330b5426f146ec6705243f497f95f08916a40c1db582c6e07d7e&',
                url: 'https://discord.gg/xQF9f9yUEM'
            })
            .setDescription('**Halt the beats! Music taking a break..**')
            .setColor('#2b71ec');

        message.reply({ embeds: [embed] });
    } else if (command === "resume") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) return message.channel.send("No player available.");

        player.pause(false);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: 'Playback Resumed!',
                iconURL: 'https://cdn.discordapp.com/attachments/1175488636033175602/1175488720762310757/play.png?ex=656b6a2e&is=6558f52e&hm=ae4f01060fe8ae93f062d6574ef064ca0f6b4cf40b172f1bd54d8d405809c7df&',
                url: 'https://discord.gg/xQF9f9yUEM'
            })
            .setDescription('**Back in action! Let the beats roll..**')
            .setColor('#2b71ec');
        message.reply({ embeds: [embed] });

    } else if (command === "seek") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) return message.channel.send("No player available.");

        const position = parseInt(args[0]);
        if (isNaN(position)) return message.channel.send("**Invalid position. Please provide a valid number of milliseconds.**");

        player.seek(position);
    } else if (command === "remove") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) return message.channel.send("No player available.");

        const index = parseInt(args[0]);
        if (isNaN(index) || index < 1 || index > player.queue.size) {
            return message.channel.send(`Invalid index. Please provide a valid number between 1 and ${player.queue.size}.`);
        }

        const removedTrack = player.queue.remove(index - 1);

        if (!removedTrack) return message.channel.send("No track found at the specified index.");
        const embed = new EmbedBuilder()
            .setColor('#188dcc')
            .setAuthor({
                name: 'Removed Sucessfully!',
                iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236794583732457473/7828-verify-ak.gif?ex=6641dff7&is=66408e77&hm=e4d3f67ff76adbb3b7ee32fa57a24b7ae4c5acfe9380598e2f7e1a6c8ab6244c&',
                url: 'https://discord.gg/xQF9f9yUEM'
            })
            .setDescription(`**Removed track:** ${removedTrack.info.title}`);
        message.reply({ embeds: [embed] });

    } else if (command === "queue") {
        const player = client.riffy.players.get(message.guild.id);
        if (!player || player.queue.size === 0) return message.channel.send("The queue is currently empty.");

        const queueList = player.queue.map((track
