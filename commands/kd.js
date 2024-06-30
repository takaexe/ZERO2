const axios = require('axios');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

async function fetchKD(playerName) {
    try {
        const url = `https://tracker.gg/valorant/profile/${encodeURIComponent(playerName)}/overview`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Use o seletor CSS correto para encontrar o elemento que contém o KD
        const kdRatio = $('#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid.container > div.area-main > div.area-main-stats > div.card.bordered.header-bordered.responsive.segment-stats > div.main > div:nth-child(8) > div > div.numbers > span.flex.items-center.gap-2 > span').text().trim();

        return kdRatio;
    } catch (error) {
        console.error('Erro ao buscar KD:', error);
        return null;
    }
}

module.exports = {
    name: 'kd',
    description: 'Verifica o KD de um jogador no Tracker.gg',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Por favor, forneça o nome do jogador.');
        }

        const playerName = args.join(' ');

        const kdRatio = await fetchKD(playerName);

        if (!kdRatio) {
            return message.reply(`Não foi possível encontrar o KD para o jogador "${playerName}".`);
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`KD de ${playerName}`)
            .setDescription(`O KD de ${playerName} é ${kdRatio}`);

        message.channel.send({ embeds: [embed] });
    },
};
