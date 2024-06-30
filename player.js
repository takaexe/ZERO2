const { Riffy } = require("riffy");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { queueNames } = require("./commands/play");

function initializePlayer(client) {
    const nodes = [
        {
            host: "lava-v3.ajieblogs.eu.org",
            port: 443,
            password: "https://dsc.gg/ajidevserver",
            secure: true
        },
    ];

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guildId = payload.d.guild_id;
            if (!guildId) return;

            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v3"
    });

    client.riffy.on("nodeConnect", node => {
        console.log(`Node "${node.name}" connected.`);
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`Node "${node.name}" encountered an error: ${error.message}.`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);

        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor({
                name: 'Está tocando.',
                iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236664581364125787/music-play.gif',
                url: 'https://instagram.com/taka.exe'
            })
            .setDescription(`**[${track.info.title}](${track.info.uri})**\nby ${track.info.author}`)
            .setThumbnail(track.info.thumbnail)
            .setImage('https://cdn.discordapp.com/attachments/1004341381784944703/1165201249331855380/RainbowLine.gif')
            .setFooter('Clique nos botões abaixo para controlar a reprodução!')
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('loopQueue')
                    .setLabel('Ligar repetição! 🔁')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('disableLoop')
                    .setLabel('Desligar repetição!')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('pauseTrack')
                    .setLabel('Pausar ⏸️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('playTrack')
                    .setLabel('Reproduzir ▶️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('skipTrack')
                    .setLabel('Pular ⏭️')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('showQueue')
                    .setLabel('Playlist ⏏️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('clearQueue')
                    .setLabel('Limpar a playlist 🗑️')
                    .setStyle('DANGER'),
            );

        const message = await channel.send({ embeds: [embed], components: [row] });

        const filter = i => ['loopQueue', 'disableLoop', 'pauseTrack', 'playTrack', 'skipTrack', 'showQueue', 'clearQueue'].includes(i.customId);
        const collector = message.createMessageComponentCollector({ filter, time: 180000 });

        setTimeout(() => {
            row.components.forEach(component => component.setDisabled(true));
            message.edit({ components: [row] }).catch(console.error);
        }, 180000);

        collector.on('collect', async i => {
            await i.deferUpdate();

            switch (i.customId) {
                case 'loopQueue':
                    setLoop(player, 'queue');
                    await channel.send({ content: '**A repetição das músicas está ativada!**', embeds: [loopEmbed] });
                    break;
                case 'pauseTrack':
                    player.pause(true);
                    await channel.send({ content: '**A música foi pausada!**', embeds: [pauseEmbed] });
                    break;
                case 'playTrack':
                    player.pause(false); // Resume playing
                    await channel.send({ content: '**A música foi reproduzida!**', embeds: [playEmbed] });
                    break;
                case 'skipTrack':
                    player.stop();
                    await channel.send({ content: '**Pulando para a próxima música!**', embeds: [skipEmbed] });
                    break;
                case 'disableLoop':
                    setLoop(player, 'none');
                    await channel.send({ content: '**A repetição de músicas está desativada!**', embeds: [loopEmbed] });
                    break;
                case 'showQueue':
                    showQueue(channel, queueNames);
                    break;
                case 'clearQueue':
                    clearQueue(player);
                    await channel.send({ content: '**Playlist de músicas limpa com sucesso!**', embeds: [queueEmbed] });
                    break;
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        const autoplay = false;

        if (autoplay) {
            player.autoplay(player);
        } else {
            player.destroy();
            const embed = new MessageEmbed()
                .setColor("#0099ff")
                .setDescription('**Acabou as músicas! Desconectando o bot...**');

            await channel.send({ embeds: [embed] });
        }
    });

    function setLoop(player, loopType) {
        player.setLoop(loopType === 'queue' ? 'queue' : 'none');
    }

    function clearQueue(player) {
        player.queue.clear();
        queueNames.length = 0;
    }

    function showQueue(channel, queue) {
        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Playlist atual")
            .setDescription(queue.map((song, index) => `${index + 1}. ${song}`).join('\n'));

        channel.send({ embeds: [embed] });
    }
}

module.exports = { initializePlayer };
