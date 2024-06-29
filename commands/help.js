const { EmbedBuilder } = require('discord.js');


module.exports = {
  name: "help",
  description: "Obtenha informações sobre o bot",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
     

      const embed = new EmbedBuilder()
         .setColor('#0099ff')
      .setTitle('💎 Satoru Music')
      .setDescription('Bem-vindo ao Bot de Música!\n\n- Aqui estão os comandos disponíveis:\n\n' +
        '**/play :** Comece a tocar as músicas.\n' +
        '**/ping :** Verifique a latência do bot.\n' +
        '**/support :** Exibir informações do servidor de suporte');

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
    console.error(e); 
  }
  },
};
