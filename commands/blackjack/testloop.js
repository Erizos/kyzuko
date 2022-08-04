const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  aliases: [],
  run: (client, message, args, interaction) => {
    let i = 0,
      howmanyTimes = 10;
    function loop() {
      const exec = new MessageEmbed()
        .setColor("GREEN")
        .setDescription(`${i}`)
        .setTimestamp()
        .setFooter({
          text: client.user.tag,
          iconURL: client.user.displayAvatarURL(),
        });
      message.channel.send({ embeds: [exec] });
      if (i < howmanyTimes) {
        setTimeout(loop, 3000);
        ++i;
      }
    }
    loop();
  },
};
