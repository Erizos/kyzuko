const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "avatar",
  category: "fun",
  aliases: ["avt"],
  category: "utils",
  run: (client, message, args) => {
    const member =
      message.mentions.members.first() ||
      message.mentions.members.get(args[0]) ||
      message.author;
    const avatarURL = member.displayAvatarURL({
      format: "png",
      size: 4096,
      dynamic: true,
    });
    const embed = new MessageEmbed()
      .setImage(avatarURL)
      .setColor(message.member.displayHexColor)
      .setDescription(`Avatar của ${member}`);
    message.channel.send({ embeds: [embed] });
  },
};
