const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Mostra o avatar do usuário mencionado',
    execute(message, args) {
        if (!message.mentions.users.size) {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${message.author.username}'s avatar`)
                .setImage(message.author.displayAvatarURL({ format: 'png', dynamic: true }));
            return message.channel.send({ embeds: [embed] });
        }

        const avatarList = message.mentions.users.map(user => {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${user.username}'s avatar`)
                .setImage(user.displayAvatarURL({ format: 'png', dynamic: true }));
            return embed;
        });

        message.channel.send({ embeds: avatarList });
    },
};
