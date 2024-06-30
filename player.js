const { Riffy } = require("riffy");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
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
        console.log(`Nó "${node.name}" conectado.`);
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`Nó "${node.name}" encontrou um erro: ${error.message}.`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);

        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor('Tocando agora', 'https://cdn.discordapp.com/attachments/1230824451990622299/1236664581364125787/music-play.gif')
            .setDescription(`➡️ **Nome da música:** [${track.info.title}](${track.info.uri})\n➡️ **Autor:** ${track.info.author}\n➡️ **Plataformas:** YouTube, Spotify, SoundCloud`)
            .setImage('https://cdn.discordapp.com/attachments/1004341381784944703/1165201249331855380/RainbowLine.gif')
            .setThumbnail(track.info.thumbnail)
            .setTimestamp()
            .setFooter('Clique nos botões abaixo para controlar a reprodução!');

        const loopButton = new MessageButton()
            .setCustomId('loopQueue')
            .setLabel('Ativar repetição')
            .setStyle('PRIMARY');

        const disableLoopButton = new MessageButton()
            .setCustomId('disableLoop')
            .setLabel('Desativar repetição')
            .setStyle('PRIMARY');

        const skipButton = new MessageButton()
            .setCustomId('skipTrack')
            .setLabel('Pular')
            .setStyle('SUCCESS');

        const pauseButton = new MessageButton()
            .setCustomId('pauseTrack')
            .setLabel('Pausar')
            .setStyle('PRIMARY');

        const playButton = new MessageButton()
            .setCustomId('playTrack')
            .setLabel('Reproduzir')
            .setStyle('PRIMARY');

        const showQueueButton = new MessageButton()
            .setCustomId('showQueue')
            .setLabel('Mostrar lista de reprodução')
            .setStyle('PRIMARY');

        const clearQueueButton = new MessageButton()
            .setCustomId('clearQueue')
            .setLabel('Limpar lista de reprodução')
            .setStyle('DANGER');

        const actionRow = new MessageActionRow()
            .addComponents(loopButton, disableLoopButton, showQueueButton, clearQueueButton, skipButton, pauseButton, playButton);

        const message = await channel.send({ embeds: [embed], components: [actionRow] });

        const filter = i => i.customId === 'loopQueue' || i.customId === 'skipTrack' || i.customId === 'disableLoop' || i.customId === 'showQueue' || i.customId === 'clearQueue' || i.customId === 'pauseTrack' || i.customId === 'playTrack';
        const collector = message.createMessageComponentCollector({ filter, time: 180000 });

        setTimeout(() => {
            actionRow.components.forEach(component => component.setDisabled(true));
            message.edit({ components: [actionRow] }).catch(console.error);
        }, 180000);

        collector.on('collect', async i => {
            await i.deferUpdate();

            if (i.customId === 'loopQueue') {
                setLoop(player, 'queue');
                const loopEmbed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("Repetição ativada!")
                    .setAuthor('Repetição ativada!', 'https://cdn.discordapp.com/attachments/1156866389819281418/1157318080670728283/7905-repeat.gif')
                    .setDescription("A repetição da música/lista de reprodução está ativada!");

                await channel.send({ embeds: [loopEmbed] });

            } else if (i.customId === 'skipTrack') {
                player.stop();
                const skipEmbed = new MessageEmbed()
                    .setColor('#3498db')
                    .setTitle("Música pulada...")
                    .setAuthor('Música pulada...', 'https://cdn.discordapp.com/attachments/1156866389819281418/1157269773118357604/giphy.gif')
                    .setDescription("O bot vai tocar a próxima música!")
                    .setTimestamp();

                await channel.send({ embeds: [skipEmbed] });

            } else if (i.customId === 'disableLoop') {
                setLoop(player, 'none');
                const loopEmbed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("Repetição desativada")
                    .setAuthor('Repetição desativada', 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif')
                    .setDescription("A repetição da músicas/lista de reprodução está desativada!");

                await channel.send({ embeds: [loopEmbed] });

            } else if (i.customId === 'showQueue') {
                showQueue(channel, queueNames);

            } else if (i.customId === 'clearQueue') {
                clearQueue(player);
                const queueEmbed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("Lista de reprodução está Limpa")
                    .setAuthor('Lista de reprodução está Limpa', 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif')
                    .setDescription("A lista de reprodução foi limpa com sucesso!");

                await channel.send({ embeds: [queueEmbed] });

            } else if (i.customId === 'pauseTrack') {
                player.pause(true);
                const pauseEmbed = new MessageEmbed()
                    .setColor("#FFA500")
                    .setTitle("Música pausada")
                    .setAuthor('Música pausada', 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif')
                    .setDescription("A música está pausada!");

                await channel.send({ embeds: [pauseEmbed] });

            } else if (i.customId === 'playTrack') {
                player.pause(false);
                const playEmbed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("Música reproduzida")
                    .setAuthor('Música reproduzida', 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif')
                    .setDescription("A música está sendo reproduzida!");

                await channel.send({ embeds: [playEmbed] });
            }
        });

        collector.on('end', collected => {
            console.log(`Foram coletadas ${collected.size} interações.`);
        });
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        const autoplay = false;

        if (autoplay) {
            player.autoplay(player);
        } else {
            player.destroy();
            const queueEmbed = new MessageEmbed()
                .setColor("#0099ff")
                .setDescription("Acabou as músicas! Desconectando o bot...");

            await channel.send({ embeds: [queueEmbed] });
        }
    });

    function setLoop(player, loopType) {
        if (loopType === "queue") {
            player.setLoop("queue");
        } else {
            player.setLoop("none");
        }
    }

    function clearQueue(player) {
        player.queue
