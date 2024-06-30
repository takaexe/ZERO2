const axios = require('axios');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

// Função para buscar o KD do jogador pelo nome
async function fetchKD(playerName) {
    try {
        // URL da página do Tracker.gg (substitua com a URL correta para o seu jogo)
        const url = `https://tracker.gg/valorant/profile/${encodeURIComponent(playerName)}/overview`;

        // Faz a requisição HTTP para obter o HTML da página
        const response = await axios.get(url);

        // Carrega o HTML da página usando Cheerio
        const $ = cheerio.load(response.data);

        // Extrai o KD (exemplo fictício, substitua com seu código real de extração)
        const kdRatio = $('.kd-ratio').text().trim();

        return kdRatio;
    } catch (error) {
        console.error('Erro ao buscar KD:', error);
        return null;
    }
}

// Função para buscar o KD do jogador pelo nome e tag
async function fetchKDByTag(playerName, tag) {
    try {
        // URL da página do Tracker.gg (substitua com a URL correta para o seu jogo)
        const url = `https://tracker.gg/valorant/profile/${encodeURIComponent(playerName)}/overview`;

        // Faz a requisição HTTP para obter o HTML da página
        const response = await axios.get(url);

        // Carrega o HTML da página usando Cheerio
        const $ = cheerio.load(response.data);

        // Extrai o KD (exemplo fictício, substitua com seu código real de extração)
        const kdRatio = $('.kd-ratio').text().trim();

        return kdRatio;
    } catch (error) {
        console.error('Erro ao buscar KD pelo nome e tag:', error);
        return null;
    }
}

// Comando para !kd <nome_do_jogador> ou !kd <nome_do_jogador> <tag>
module.exports = {
    name: 'kd',
    description: 'Verifica o KD de um jogador no Tracker.gg',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Por favor, forneça o nome do jogador.');
        }

        let playerName = args[0];
        let tag = null;

        if (args.length > 1) {
            tag = args[1];
            playerName += `#${tag}`;
        }

        // Chama a função fetchKD para buscar o KD do jogador
        const kdRatio = tag ? await fetchKDByTag(playerName, tag) : await fetchKD(playerName);

        if (!kdRatio) {
            return message.reply(`Não foi possível encontrar o KD para o jogador "${playerName}".`);
        }

        // Cria um embed com o resultado
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`KD de ${playerName}`)
            .setDescription(`O KD de ${playerName} é ${kdRatio}`);

        // Envia o embed no canal onde o comando foi utilizado
        message.channel.send({ embeds: [embed] });
    },
};
