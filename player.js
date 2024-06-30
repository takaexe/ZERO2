const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { initializePlayer, setLoop, clearQueue, showQueue } = require("./initializePlayer"); // Supondo que este arquivo exporta essas funções
const { queueNames } = require("./commands/play");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

initializePlayer(client); // Inicializando o player

client.on('messageCreate', async (message) => {
    if (message.content === '!play') {
        // Simulando dados da música para o exemplo
        const trackInfo = {
            title: 'Nome da Música',
            author: 'Autor da Música',
            uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: 'https://example.com/thumbnail.jpg'
        };

        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor({
                name: 'Está tocando.',
                iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236664581364125787/music-play.gif?ex=6638d524&is=663783a4&hm=5179f7d8fcd18edc1f7d0291bea486b1f9ce69f19df8a96303b75505e18baa3a&',
                url: 'https://instagram.com/taka.exe'
            })
            .setDescription(`➡️ **Nome da música:** [${trackInfo.title}](${trackInfo.uri})\n➡️ **Autor:** ${trackInfo.author}\n➡️ **Plataformas :** YouTube, Spotify, SoundCloud`)
            .setImage(`https://cdn.discordapp.com/attachments/1004341381784944703/1165201249331855380/RainbowLine.gif?ex=663939fa&is=6637e87a&hm=e02431de164b901e07b55d8f8898ca5b1b2832ad11985cecc3aa229a7598d610&`)
            .setThumbnail(trackInfo.thumbnail)
            .setTimestamp()
            .setFooter({ text: 'Clique nos botões abaixo para controlar a reprodução!' });

        const loopQueueButton = new MessageButton()
            .setCustomId('loopQueue')
            .setLabel('Ligar repetição!🔁')
            .setStyle('PRIMARY');

        const disableLoopButton = new MessageButton()
            .setCustomId('disableLoop')
            .setLabel('Desligar repetição! ')
            .setStyle('PRIMARY');

        const skipButton = new MessageButton()
            .setCustomId('skipTrack')
            .setLabel('Pular ⏭️')
            .setStyle('SUCCESS');

        const showQueueButton = new MessageButton()
            .setCustomId('showQueue')
            .setLabel('Playlist ⏏')
            .setStyle('SECONDARY');

        const clearQueueButton = new MessageButton()
            .setCustomId('clearQueue')
            .setLabel('Limpar a playlist 🗑️')
            .setStyle('DANGER');

        const actionRow = new MessageActionRow()
            .addComponents(loopQueueButton, disableLoopButton, skipButton, showQueueButton, clearQueueButton);

        const sentMessage = await message.channel.send({ embeds: [embed], components: [actionRow] });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 180000 });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.customId === 'loopQueue') {
                setLoop(player, 'queue');
                const loopEmbed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setAuthor({
                        name: 'Repetição ligada!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157318080670728283/7905-repeat.gif?ex=66383bb4&is=6636ea34&hm=65f37cf88245f1c09285b547fda57b82828b3bbcda855e184f446d6ff43756b3&',
                        url: 'https://instagram.com/taka.exe'
                    })
                    .setTitle("**A repetição das músicas está ativada!**");

                await interaction.channel.send({ embeds: [loopEmbed] });
            } else if (interaction.customId === 'skipTrack') {
                player.stop();
                const skipEmbed = new MessageEmbed()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Pulando música...',
                        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157269773118357604/giphy.gif?ex=6517fef6&is=6516ad76&hm=f106480f7d017a07f75d543cf545bbea01e9cf53ebd42020bd3b90a14004398e&',
                        url: 'https://instagram.com/taka.exe'
                    })
                    .setTitle("**Vou tocar a próxima música!**")
                    .setTimestamp();

                await interaction.channel.send({ embeds: [skipEmbed] });
            } else if (interaction.customId === 'disableLoop') {
                setLoop(player, 'none');
                const loopEmbed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setAuthor({
                        name: 'Repetição desativada.',
                        iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif?ex=6638b97d&is=663767fd&hm=021725868cbbc66f35d2b980585489f93e9fd366aa57640732dc49e7da9a80ee&',
                        url: 'https://instagram.com/taka.exe'
                    })
                    .setDescription('**A repetição de músicas está desativada!**');

                await interaction.channel.send({ embeds: [loopEmbed] });
            } else if (interaction.customId === 'showQueue') {
                showQueue(interaction.channel, queueNames); // Supondo que showQueue seja uma função que mostra a lista de reprodução
            } else if (interaction.customId === 'clearQueue') {
                clearQueue(player);
                const queueEmbed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setAuthor({
                        name: 'Playlist limpa',
                        iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif?ex=6638b97d&is=663767fd&hm=021725868cbbc66f35d2b980585489f93e9fd366aa57640732dc49e7da9a80ee&',
                        url: 'https://instagram.com/taka.exe'
                    })
                    .setDescription('**Playlist de músicas limpa com sucesso!**');

                await interaction.channel.send({ embeds: [queueEmbed] });
            }
        });

        collector.on('end', () => {
            const disabledRow = new MessageActionRow()
                .addComponents(
                    loopQueueButton.setDisabled(true),
                    disableLoopButton.setDisabled(true),
                    skipButton.setDisabled(true),
                    showQueueButton.setDisabled(true),
                    clearQueueButton.setDisabled(true)
                );

            sentMessage.edit({ components: [disabledRow] })
                .catch(console.error);
        });
    }
});
