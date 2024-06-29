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
        '**/play :** Toque suas musicas pesquisando pelo nome ou link.\n' +
        '**/ping :** Verifique a latência do bot.\n' +
        '**/suporte :**  ̶E̶x̶i̶b̶i̶r̶ ̶i̶n̶f̶o̶r̶m̶a̶ç̶õ̶e̶s̶ ̶d̶o̶ ̶s̶e̶r̶v̶i̶d̶o̶r̶ ̶d̶e̶ ̶s̶u̶p̶o̶r̶t̶e̶');

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
    console.error(e); 
  }
  },
};
