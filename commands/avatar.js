const { MessageEmbed, User } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Mostra o avatar do usuário mencionado ou do autor da mensagem',
    execute(message, args) {
        let user;
        
        // Verifica se há menção a um usuário
        if (message.mentions.users.size) {
            user = message.mentions.users.first();
        } else if (args.length) {
            // Se não há menção, verifica se foi passado um ID ou nome
            const searchString = args.join(' ');
            user = message.client.users.cache.find(u => u.username === searchString || u.id === searchString);
        } else {
            // Caso contrário, mostra o avatar do autor da mensagem
            user = message.author;
        }

        if (!user) {
            return message.channel.send('Usuário não encontrado!');
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${user.username}'s avatar`)
            .setImage(user.displayAvatarURL({ format: 'png', dynamic: true }));

        message.channel.send({ embeds: [embed] });
    },
};
