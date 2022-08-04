const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["clr"],
  category: "utils",
  run: (client, message, args) => {
    const number = args.join(" ");
    const error = new MessageEmbed()
      .setTitle(`Lời thân thương gửi gắm tới ${message.author.username}`)
      .setColor("RED");
    if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) {
      error.setDescription("Tao không có quyền để làm thế");
      return message.channel.send({ embeds: [error] });
    }
    if (!message.member.permissions.has("MANAGE_MESSAGES")) {
      error.setDescription("Mày không có quyền để làm thế");
      return message.channel.send({ embeds: [error] });
    }
    if (!number || isNaN(number)) {
      error.setDescription("Nhập số chat cần xóa vô!");
      return message.channel.send({ embeds: [error] });
    }
    if (number > 100) {
      error.setDescription("Chỉ được ≤ 100");
      return message.channel.send({ embeds: [error] });
    }
    message.delete();
    message.channel.bulkDelete(number);
  },
};
